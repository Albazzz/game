package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.airdefense.domain.AirDefenseAnswerRecord;
import admin.jlas.game.modules.airdefense.domain.AirDefenseConfig;
import admin.jlas.game.modules.airdefense.domain.AirDefenseObjective;
import admin.jlas.game.modules.airdefense.domain.AirDefenseOutcome;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayerState;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSessionStatus;
import admin.jlas.game.modules.airdefense.domain.Aircraft;
import admin.jlas.game.modules.airdefense.dto.AirDefenseActionMeta;
import admin.jlas.game.modules.airdefense.dto.AirDefenseEventType;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import admin.jlas.game.modules.airdefense.mapper.AirDefenseViewMapper;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseBroadcaster;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseSessionRegistry;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.runtime.ArenaGameFinishedEvent;
import admin.jlas.game.modules.auth.repository.UserRepository;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.validation.JapaneseAnswerValidationService;
import admin.jlas.game.modules.validation.JapaneseAnswerValidationService.ValidationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * Engine authoritative Air Defense. Client chỉ gửi aircraftId + text; spawn,
 * deadline, verdict, HP, score và kết ván đều được serialize dưới lock session.
 */
@Service
public class AirDefenseMatchService {

    private static final Logger log = LoggerFactory.getLogger(AirDefenseMatchService.class);

    private final AirDefenseSessionRegistry registry;
    private final AirDefenseQuestionFactory questionFactory;
    private final JapaneseAnswerValidationService answerValidationService;
    private final AirDefenseViewMapper viewMapper;
    private final AirDefenseBroadcaster broadcaster;
    private final AirDefenseResultRecorder resultRecorder;
    private final UserRepository userRepository;
    private final TaskScheduler taskScheduler;
    private final GameProperties gameProperties;
    private final Clock clock;
    private final ApplicationEventPublisher eventPublisher;

    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public AirDefenseMatchService(AirDefenseSessionRegistry registry,
                                  AirDefenseQuestionFactory questionFactory,
                                  JapaneseAnswerValidationService answerValidationService,
                                  AirDefenseViewMapper viewMapper,
                                  AirDefenseBroadcaster broadcaster,
                                  AirDefenseResultRecorder resultRecorder,
                                  UserRepository userRepository,
                                  TaskScheduler taskScheduler,
                                  GameProperties gameProperties,
                                  Clock clock,
                                  ApplicationEventPublisher eventPublisher) {
        this.registry = registry;
        this.questionFactory = questionFactory;
        this.answerValidationService = answerValidationService;
        this.viewMapper = viewMapper;
        this.broadcaster = broadcaster;
        this.resultRecorder = resultRecorder;
        this.userRepository = userRepository;
        this.taskScheduler = taskScheduler;
        this.gameProperties = gameProperties;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }

    public AirDefenseSession createSolo(UserPrincipal user, GameSettings settings) {
        AirDefenseConfig config = AirDefenseConfig.from(settings, AirDefensePlayMode.SOLO);
        AirDefenseSession session = new AirDefenseSession(UUID.randomUUID().toString(),
                null, null, AirDefensePlayMode.SOLO, config, Instant.now(clock));
        session.addPlayer(new AirDefensePlayerState(user.getUserId(), user.getUsername(),
                user.getDisplayName(), user.getAvatar(), 0, config.maxHp()),
                questionFactory.createDeck(config));
        activate(session);
        return session;
    }

    public AirDefenseSession createForRoom(String roomId, Long matchId, GameSettings settings,
                                            List<RoomPlayer> roomPlayers) {
        AirDefenseConfig config = AirDefenseConfig.from(settings, AirDefensePlayMode.MULTIPLAYER);
        if (roomPlayers.size() != 2) {
            throw new ApiException(ErrorCode.START_REQUIREMENTS_UNMET,
                    "Air Defense 1v1 cần đúng 2 người chơi");
        }
        AirDefenseSession session = new AirDefenseSession(UUID.randomUUID().toString(),
                roomId, matchId, AirDefensePlayMode.MULTIPLAYER, config, Instant.now(clock));
        roomPlayers.stream().sorted(Comparator.comparingInt(RoomPlayer::getSlot))
                .forEach(roomPlayer -> {
                    String username = userRepository.findById(roomPlayer.getUserId())
                            .map(user -> user.getEmail()).orElse(String.valueOf(roomPlayer.getUserId()));
                    session.addPlayer(new AirDefensePlayerState(roomPlayer.getUserId(), username,
                            roomPlayer.getDisplayName(), roomPlayer.getAvatar(), roomPlayer.getSlot(),
                            config.maxHp()), questionFactory.createDeck(config));
                });
        activate(session);
        return session;
    }

    private void activate(AirDefenseSession session) {
        session.withLock(() -> {
            if (session.getConfig().objective() == AirDefenseObjective.SCORE_CHALLENGE
                    || session.getConfig().objective() == AirDefenseObjective.SCORE_RACE) {
                session.setTotalDeadlineAt(Instant.now(clock)
                        .plusSeconds(session.getConfig().durationSeconds()));
            }
            session.bumpVersion();
        });
        registry.register(session);
        for (AirDefensePlayerState player : session.orderedPlayers()) {
            spawnNext(session, player.getUserId());
        }
        scheduleTotalDeadline(session);
        log.info("Air Defense session {} bắt đầu ({} / {} người)",
                session.getSessionId(), session.getConfig().objective(),
                session.playersByUserId().size());
    }

    public AirDefenseStateView getState(UserPrincipal user, String sessionId) {
        AirDefenseSession session = registry.requireById(sessionId);
        return session.withLock(() -> {
            requireParticipant(session, user.getUserId());
            return viewMapper.toState(session, user.getUserId());
        });
    }

    public Optional<AirDefenseSession> find(String sessionId) {
        return registry.findById(sessionId);
    }

    public void sendState(UserPrincipal user, String sessionId) {
        AirDefenseSession session = registry.requireById(sessionId);
        AirDefensePlayerState player = session.withLock(() ->
                requireParticipant(session, user.getUserId()));
        broadcaster.sendState(session, player);
    }

    public void submitAnswer(UserPrincipal user, String sessionId, String aircraftId,
                             String submittedAnswer, String commandId) {
        AirDefenseSession session = registry.requireById(sessionId);
        AnswerOutcome outcome = session.withLock(() -> answerInLock(session, user.getUserId(),
                aircraftId, submittedAnswer, commandId));
        if (outcome.duplicate()) {
            broadcaster.sendState(session, outcome.player());
            return;
        }
        if (outcome.correct()) {
            cancelTask(impactKey(sessionId, aircraftId));
        }
        if (outcome.finished()) {
            completeSession(session);
        }
        broadcaster.broadcast(session, outcome.eventType(), outcome.meta());
    }

    private AnswerOutcome answerInLock(AirDefenseSession session, long userId,
                                        String aircraftId, String submittedAnswer,
                                        String commandId) {
        requireRunning(session);
        AirDefensePlayerState player = requireParticipant(session, userId);
        if (!session.registerCommand(userId, commandId)) {
            return AnswerOutcome.duplicate(player);
        }
        Aircraft aircraft = session.findAircraft(aircraftId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_MOVE,
                        "Mục tiêu không tồn tại"));
        if (aircraft.getTargetUserId() != userId) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Đây không phải mục tiêu của bạn");
        }
        if (!aircraft.isActive()) {
            throw new ApiException(ErrorCode.INVALID_MOVE, "Mục tiêu đã được xử lý");
        }
        Instant now = Instant.now(clock);
        if (!now.isBefore(aircraft.getImpactAt())) {
            throw new ApiException(ErrorCode.INVALID_MOVE, "Đáp án đến sau thời hạn");
        }

        ValidationResult verdict = answerValidationService.validate(submittedAnswer,
                aircraft.getQuestion().expectedAnswer(), aircraft.getQuestion().aliases(),
                aircraft.getQuestion().questionType());
        long responseMs = Math.max(0, Duration.between(aircraft.getSpawnAt(), now).toMillis());
        AirDefenseAnswerRecord record = new AirDefenseAnswerRecord(
                aircraft.getQuestion().questionId(), aircraft.getQuestion().questionText(),
                aircraft.getQuestion().expectedAnswer(), submittedAnswer,
                verdict.correct(), responseMs, now);

        boolean finished = false;
        String eventType;
        if (verdict.correct()) {
            aircraft.destroy(userId, now);
            player.recordCorrect(record);
            finished = finishIfNeededInLock(session, player, now);
            eventType = finished ? AirDefenseEventType.GAME_OVER
                    : AirDefenseEventType.ANSWER_CORRECT;
        } else {
            player.recordIncorrect(record);
            eventType = AirDefenseEventType.ANSWER_INCORRECT;
        }
        session.bumpVersion();
        AirDefenseActionMeta meta = new AirDefenseActionMeta(aircraftId, userId,
                verdict.correct(), verdict.matchKind());
        return new AnswerOutcome(eventType, meta, verdict.correct(), finished, false, player);
    }

    private void spawnNext(AirDefenseSession session, long userId) {
        SpawnOutcome outcome = session.withLock(() -> {
            if (session.getStatus() != AirDefenseSessionStatus.RUNNING) return null;
            AirDefensePlayerState player = session.playersByUserId().get(userId);
            if (player == null || player.getAircraftSpawned() >= session.getConfig().questionCount()) {
                return null;
            }
            var question = session.nextQuestion(userId).orElse(null);
            if (question == null) return null;
            Instant now = Instant.now(clock);
            String aircraftId = UUID.randomUUID().toString();
            Aircraft aircraft = new Aircraft(aircraftId, question, userId,
                    session.getConfig().difficulty(), player.getAircraftSpawned() % 3,
                    now, now.plusMillis(session.getConfig().travelTimeMs()));
            session.addAircraft(aircraft);
            player.incrementAircraftSpawned();
            session.bumpVersion();
            return new SpawnOutcome(aircraft,
                    player.getAircraftSpawned() < session.getConfig().questionCount());
        });
        if (outcome == null) return;
        scheduleImpact(session, outcome.aircraft());
        if (outcome.moreQuestions()) scheduleSpawn(session, userId);
        broadcaster.broadcast(session, AirDefenseEventType.AIRCRAFT_SPAWNED,
                AirDefenseActionMeta.aircraft(outcome.aircraft().getAircraftId(), userId));
    }

    private void scheduleSpawn(AirDefenseSession session, long userId) {
        String key = spawnKey(session.getSessionId(), userId);
        Instant at = Instant.now(clock).plusMillis(session.getConfig().spawnIntervalMs());
        replaceTask(key, taskScheduler.schedule(() -> {
            scheduledTasks.remove(key);
            spawnNext(session, userId);
        }, at));
    }

    private void scheduleImpact(AirDefenseSession session, Aircraft aircraft) {
        String key = impactKey(session.getSessionId(), aircraft.getAircraftId());
        replaceTask(key, taskScheduler.schedule(() -> {
            scheduledTasks.remove(key);
            impactAircraft(session, aircraft.getAircraftId());
        }, aircraft.getImpactAt()));
    }

    private void impactAircraft(AirDefenseSession session, String aircraftId) {
        ImpactOutcome outcome = session.withLock(() -> {
            if (session.getStatus() != AirDefenseSessionStatus.RUNNING) return null;
            Aircraft aircraft = session.findAircraft(aircraftId).orElse(null);
            if (aircraft == null || !aircraft.isActive()) return null;
            Instant now = Instant.now(clock);
            if (now.isBefore(aircraft.getImpactAt())) {
                return new ImpactOutcome(aircraft, false, true);
            }
            AirDefensePlayerState player = session.playersByUserId()
                    .get(aircraft.getTargetUserId());
            aircraft.impact(now);
            player.recordImpact(new AirDefenseAnswerRecord(
                    aircraft.getQuestion().questionId(), aircraft.getQuestion().questionText(),
                    aircraft.getQuestion().expectedAnswer(), "", false,
                    Math.max(0, Duration.between(aircraft.getSpawnAt(), now).toMillis()), now));
            boolean finished = finishIfNeededInLock(session, player, now);
            session.bumpVersion();
            return new ImpactOutcome(aircraft, finished, false);
        });
        if (outcome == null) return;
        if (outcome.reschedule()) {
            scheduleImpact(session, outcome.aircraft());
            return;
        }
        if (outcome.finished()) completeSession(session);
        broadcaster.broadcast(session,
                outcome.finished() ? AirDefenseEventType.GAME_OVER
                        : AirDefenseEventType.AIRCRAFT_IMPACTED,
                AirDefenseActionMeta.aircraft(outcome.aircraft().getAircraftId(),
                        outcome.aircraft().getTargetUserId()));
    }

    private boolean finishIfNeededInLock(AirDefenseSession session,
                                          AirDefensePlayerState changedPlayer, Instant now) {
        if (changedPlayer.getHp() <= 0) {
            if (session.getPlayMode() == AirDefensePlayMode.SOLO) {
                finishInLock(session, AirDefenseOutcome.RUN_ENDED, null, false, now);
            } else {
                Long opponent = session.orderedPlayers().stream()
                        .map(AirDefensePlayerState::getUserId)
                        .filter(id -> id != changedPlayer.getUserId()).findFirst().orElse(null);
                finishInLock(session, AirDefenseOutcome.VICTORY, opponent, false, now);
            }
            return true;
        }

        AirDefenseObjective objective = session.getConfig().objective();
        if ((objective == AirDefenseObjective.SCORE_CHALLENGE
                || objective == AirDefenseObjective.SCORE_RACE)
                && changedPlayer.getCorrectAnswers() >= session.getConfig().targetCorrect()) {
            finishInLock(session,
                    session.getPlayMode() == AirDefensePlayMode.SOLO
                            ? AirDefenseOutcome.CHALLENGE_COMPLETE : AirDefenseOutcome.VICTORY,
                    changedPlayer.getUserId(), false, now);
            return true;
        }

        if (session.allQuestionsResolved()) {
            if (session.getPlayMode() == AirDefensePlayMode.SOLO) {
                boolean completed = objective == AirDefenseObjective.PRACTICE
                        || objective == AirDefenseObjective.SURVIVAL;
                finishInLock(session, completed ? AirDefenseOutcome.CHALLENGE_COMPLETE
                        : AirDefenseOutcome.RUN_ENDED,
                        completed ? changedPlayer.getUserId() : null, false, now);
            } else {
                finishMultiplayerByScoreInLock(session, now);
            }
            return true;
        }
        return false;
    }

    private void scheduleTotalDeadline(AirDefenseSession session) {
        if (session.getTotalDeadlineAt() == null) return;
        String key = deadlineKey(session.getSessionId());
        replaceTask(key, taskScheduler.schedule(() -> {
            scheduledTasks.remove(key);
            finishOnDeadline(session);
        }, session.getTotalDeadlineAt()));
    }

    private void finishOnDeadline(AirDefenseSession session) {
        boolean finished = session.withLock(() -> {
            if (session.getStatus() != AirDefenseSessionStatus.RUNNING) return false;
            Instant now = Instant.now(clock);
            if (session.getTotalDeadlineAt() != null
                    && now.isBefore(session.getTotalDeadlineAt())) return false;
            if (session.getPlayMode() == AirDefensePlayMode.SOLO) {
                AirDefensePlayerState player = session.orderedPlayers().getFirst();
                boolean success = player.getCorrectAnswers() >= session.getConfig().targetCorrect();
                finishInLock(session, success ? AirDefenseOutcome.CHALLENGE_COMPLETE
                        : AirDefenseOutcome.TIME_UP, success ? player.getUserId() : null,
                        false, now);
            } else {
                finishMultiplayerByScoreInLock(session, now);
            }
            session.bumpVersion();
            return true;
        });
        if (finished) {
            completeSession(session);
            broadcaster.broadcast(session, AirDefenseEventType.GAME_OVER, null);
        }
    }

    private void finishMultiplayerByScoreInLock(AirDefenseSession session, Instant now) {
        List<AirDefensePlayerState> ranked = session.orderedPlayers().stream()
                .sorted(Comparator.comparingInt(AirDefensePlayerState::getCorrectAnswers).reversed()
                        .thenComparing(Comparator.comparingInt(AirDefensePlayerState::getHp).reversed())
                        .thenComparing(Comparator.comparingInt(AirDefensePlayerState::getScore).reversed()))
                .toList();
        AirDefensePlayerState first = ranked.get(0);
        AirDefensePlayerState second = ranked.get(1);
        boolean draw = first.getCorrectAnswers() == second.getCorrectAnswers()
                && first.getHp() == second.getHp() && first.getScore() == second.getScore();
        finishInLock(session, draw ? AirDefenseOutcome.DRAW : AirDefenseOutcome.VICTORY,
                draw ? null : first.getUserId(), draw, now);
    }

    private void finishInLock(AirDefenseSession session, AirDefenseOutcome outcome,
                              Long winnerUserId, boolean draw, Instant now) {
        session.setStatus(AirDefenseSessionStatus.FINISHED);
        session.setOutcome(outcome);
        session.setWinnerUserId(winnerUserId);
        session.setDraw(draw);
        session.setFinishedAt(now);
    }

    private void completeSession(AirDefenseSession session) {
        cancelSessionTasks(session.getSessionId());
        try {
            var personalBestUserIds = resultRecorder.recordFinish(session);
            session.withLock(() -> personalBestUserIds.forEach(session::markPersonalBest));
        } catch (Exception ex) {
            log.warn("Không ghi được kết quả Air Defense {}: {}",
                    session.getSessionId(), ex.getMessage());
        }
        if (session.getRoomId() != null) {
            eventPublisher.publishEvent(new ArenaGameFinishedEvent(
                    session.getRoomId(), session.getSessionId()));
        }
    }

    public AirDefenseStateView setPaused(UserPrincipal user, String sessionId, boolean paused) {
        AirDefenseSession session = registry.requireById(sessionId);
        AirDefenseStateView state = session.withLock(() -> {
            requireParticipant(session, user.getUserId());
            if (session.getPlayMode() != AirDefensePlayMode.SOLO) {
                throw new ApiException(ErrorCode.INVALID_MOVE, "Chỉ ván solo mới được tạm dừng");
            }
            Instant now = Instant.now(clock);
            if (paused) {
                if (session.getStatus() != AirDefenseSessionStatus.RUNNING) {
                    throw new ApiException(ErrorCode.INVALID_MOVE, "Ván không đang chạy");
                }
                session.setStatus(AirDefenseSessionStatus.PAUSED);
                session.setPausedAt(now);
            } else {
                if (session.getStatus() != AirDefenseSessionStatus.PAUSED) {
                    throw new ApiException(ErrorCode.INVALID_MOVE, "Ván không đang tạm dừng");
                }
                session.shiftDeadlines(Duration.between(session.getPausedAt(), now));
                session.setPausedAt(null);
                session.setStatus(AirDefenseSessionStatus.RUNNING);
            }
            session.bumpVersion();
            return viewMapper.toState(session, user.getUserId());
        });
        if (paused) {
            cancelSessionTasks(sessionId);
        } else {
            rescheduleSession(session);
        }
        broadcaster.broadcast(session,
                paused ? AirDefenseEventType.PAUSED : AirDefenseEventType.RESUMED, null);
        return state;
    }

    private void rescheduleSession(AirDefenseSession session) {
        session.withLock(() -> session.orderedAircraft().stream()
                .filter(Aircraft::isActive).toList())
                .forEach(aircraft -> scheduleImpact(session, aircraft));
        for (AirDefensePlayerState player : session.orderedPlayers()) {
            if (player.getAircraftSpawned() < session.getConfig().questionCount()) {
                scheduleSpawn(session, player.getUserId());
            }
        }
        scheduleTotalDeadline(session);
    }

    public void markDisconnected(long userId) {
        setConnected(userId, false);
    }

    public void markReconnected(long userId) {
        setConnected(userId, true);
    }

    private void setConnected(long userId, boolean connected) {
        registry.currentSessionIdOf(userId).flatMap(registry::findById).ifPresent(session -> {
            boolean changed = session.withLock(() -> {
                AirDefensePlayerState player = session.playersByUserId().get(userId);
                if (player == null || player.isConnected() == connected) return false;
                player.setConnected(connected);
                session.bumpVersion();
                return true;
            });
            if (changed) broadcaster.broadcast(session, AirDefenseEventType.PLAYER_UPDATED, null);
        });
    }

    public void abortByRoom(String roomId) {
        registry.snapshotAll().stream()
                .filter(session -> roomId.equals(session.getRoomId()))
                .forEach(session -> {
                    boolean aborted = session.withLock(() -> {
                        if (session.getStatus().isTerminal()) return false;
                        session.setStatus(AirDefenseSessionStatus.ABORTED);
                        session.setOutcome(AirDefenseOutcome.ABANDONED);
                        session.setFinishedAt(Instant.now(clock));
                        session.bumpVersion();
                        return true;
                    });
                    cancelSessionTasks(session.getSessionId());
                    if (aborted) broadcaster.broadcast(session, AirDefenseEventType.GAME_OVER, null);
                    registry.remove(session);
                });
    }

    public int sweepStaleSessions() {
        Instant threshold = Instant.now(clock)
                .minusSeconds(gameProperties.getAirDefense().getSessionIdleTimeoutMinutes() * 60L);
        int removed = 0;
        for (AirDefenseSession session : registry.snapshotAll()) {
            boolean stale = session.withLock(() ->
                    (session.getFinishedAt() == null ? session.getCreatedAt()
                            : session.getFinishedAt()).isBefore(threshold));
            if (stale) {
                cancelSessionTasks(session.getSessionId());
                registry.remove(session);
                removed++;
            }
        }
        return removed;
    }

    private void requireRunning(AirDefenseSession session) {
        if (session.getStatus().isTerminal()) throw new ApiException(ErrorCode.SESSION_FINISHED);
        if (session.getStatus() != AirDefenseSessionStatus.RUNNING) {
            throw new ApiException(ErrorCode.INVALID_MOVE, "Ván đang tạm dừng");
        }
    }

    private AirDefensePlayerState requireParticipant(AirDefenseSession session, long userId) {
        AirDefensePlayerState player = session.playersByUserId().get(userId);
        if (player == null) throw new ApiException(ErrorCode.NOT_SESSION_PLAYER);
        return player;
    }

    private void replaceTask(String key, ScheduledFuture<?> task) {
        ScheduledFuture<?> previous = scheduledTasks.put(key, task);
        if (previous != null) previous.cancel(false);
    }

    private void cancelTask(String key) {
        ScheduledFuture<?> task = scheduledTasks.remove(key);
        if (task != null) task.cancel(false);
    }

    private void cancelSessionTasks(String sessionId) {
        String prefix = sessionId + ":";
        scheduledTasks.entrySet().removeIf(entry -> {
            if (!entry.getKey().startsWith(prefix)) return false;
            entry.getValue().cancel(false);
            return true;
        });
    }

    private String spawnKey(String sessionId, long userId) {
        return sessionId + ":spawn:" + userId;
    }

    private String impactKey(String sessionId, String aircraftId) {
        return sessionId + ":impact:" + aircraftId;
    }

    private String deadlineKey(String sessionId) {
        return sessionId + ":deadline";
    }

    private record SpawnOutcome(Aircraft aircraft, boolean moreQuestions) {}
    private record ImpactOutcome(Aircraft aircraft, boolean finished, boolean reschedule) {}
    private record AnswerOutcome(String eventType, AirDefenseActionMeta meta, boolean correct,
                                 boolean finished, boolean duplicate,
                                 AirDefensePlayerState player) {
        static AnswerOutcome duplicate(AirDefensePlayerState player) {
            return new AnswerOutcome(AirDefenseEventType.SESSION_STATE, null,
                    false, false, true, player);
        }
    }
}
