package admin.jlas.game.modules.memory.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.memory.domain.MemoryCard;
import admin.jlas.game.modules.memory.domain.MemoryCardState;
import admin.jlas.game.modules.memory.domain.MemoryConfig;
import admin.jlas.game.modules.memory.domain.MemoryObjective;
import admin.jlas.game.modules.memory.domain.MemoryOutcome;
import admin.jlas.game.modules.memory.domain.MemoryPlayMode;
import admin.jlas.game.modules.memory.domain.MemoryPlayerState;
import admin.jlas.game.modules.memory.domain.MemorySession;
import admin.jlas.game.modules.memory.domain.MemorySessionStatus;
import admin.jlas.game.modules.memory.dto.MemoryEventType;
import admin.jlas.game.modules.memory.dto.MemoryStateView;
import admin.jlas.game.modules.memory.mapper.MemoryViewMapper;
import admin.jlas.game.modules.memory.runtime.MemoryBroadcaster;
import admin.jlas.game.modules.memory.runtime.MemorySessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
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
 * Engine authoritative của Memory Match. Client chỉ gửi ý định "lật thẻ X";
 * mọi phán quyết (hợp lệ, khớp cặp, đổi lượt, hết giờ, kết ván) đều ở đây
 * (rule.md §9, p2-memory §5-§7).
 */
@Service
public class MemoryService {

    private static final Logger log = LoggerFactory.getLogger(MemoryService.class);

    private final MemorySessionRegistry registry;
    private final MemoryBoardGenerator boardGenerator;
    private final MemoryViewMapper viewMapper;
    private final MemoryBroadcaster broadcaster;
    private final MemoryResultRecorder resultRecorder;
    private final GameProperties gameProperties;
    private final TaskScheduler taskScheduler;
    private final Clock clock;

    /** sessionId -> task úp lại cặp sai. */
    private final Map<String, ScheduledFuture<?>> resolveTasks = new ConcurrentHashMap<>();
    /** sessionId -> task hết lượt. */
    private final Map<String, ScheduledFuture<?>> turnTasks = new ConcurrentHashMap<>();
    /** sessionId -> task hết tổng thời gian (TIME_ATTACK). */
    private final Map<String, ScheduledFuture<?>> totalTasks = new ConcurrentHashMap<>();

    public MemoryService(MemorySessionRegistry registry,
                         MemoryBoardGenerator boardGenerator,
                         MemoryViewMapper viewMapper,
                         MemoryBroadcaster broadcaster,
                         MemoryResultRecorder resultRecorder,
                         GameProperties gameProperties,
                         TaskScheduler taskScheduler,
                         Clock clock) {
        this.registry = registry;
        this.boardGenerator = boardGenerator;
        this.viewMapper = viewMapper;
        this.broadcaster = broadcaster;
        this.resultRecorder = resultRecorder;
        this.gameProperties = gameProperties;
        this.taskScheduler = taskScheduler;
        this.clock = clock;
    }

    // ===================== TẠO VÁN =====================

    /** Ván multiplayer từ phòng; thứ tự lượt = thứ tự slot. */
    public MemorySession createForRoom(String roomId, Long matchId, GameSettings settings,
                                       List<RoomPlayer> players) {
        MemoryConfig config = MemoryConfig.from(settings, MemoryPlayMode.MULTIPLAYER);
        MemorySession session = newSession(roomId, matchId, config, MemoryPlayMode.MULTIPLAYER);
        players.stream()
                .sorted(Comparator.comparingInt(RoomPlayer::getSlot))
                .forEach(player -> session.addPlayer(new MemoryPlayerState(
                        player.getUserId(), player.getDisplayName(),
                        player.getAvatar(), player.getSlot())));
        activate(session);
        return session;
    }

    /** Ván solo qua REST, không đi qua phòng (p2-memory §1A). */
    public MemorySession createSolo(UserPrincipal user, GameSettings settings) {
        MemoryConfig config = MemoryConfig.from(settings, MemoryPlayMode.SOLO);
        MemorySession session = newSession(null, null, config, MemoryPlayMode.SOLO);
        session.addPlayer(new MemoryPlayerState(user.getUserId(), user.getDisplayName(), null, 0));
        activate(session);
        return session;
    }

    private MemorySession newSession(String roomId, Long matchId, MemoryConfig config,
                                     MemoryPlayMode playMode) {
        MemoryBoardGenerator.Board board = boardGenerator.generate(config);
        return new MemorySession(UUID.randomUUID().toString(), roomId, matchId, playMode,
                config, board.cards(), board.pairInfo(), Instant.now(clock));
    }

    private void activate(MemorySession session) {
        Instant now = Instant.now(clock);
        session.withLock(() -> {
            session.startTurn(now);
            if (session.getConfig().objective() == MemoryObjective.TIME_ATTACK) {
                session.setTotalDeadlineAt(now.plusSeconds(session.getConfig().totalSeconds()));
            }
            session.bumpVersion();
        });
        registry.register(session);
        scheduleTurnTimeout(session);
        scheduleTotalTimeout(session);
        log.info("Memory session {} bắt đầu ({} thẻ, {} người chơi)",
                session.getSessionId(), session.getConfig().boardSize(),
                session.playersByUserId().size());
    }

    // ===================== ĐỌC STATE =====================

    public MemoryStateView getState(UserPrincipal user, String sessionId) {
        MemorySession session = registry.requireById(sessionId);
        return session.withLock(() -> {
            requireParticipant(session, user.getUserId());
            return viewMapper.toStateView(session);
        });
    }

    public Optional<MemorySession> find(String sessionId) {
        return registry.findById(sessionId);
    }

    // ===================== LẬT THẺ =====================

    /**
     * Xử lý ý định lật thẻ. Toàn bộ phán quyết nằm trong lock của session để hai
     * flip đồng thời không thể cùng nhìn thấy một thẻ HIDDEN.
     */
    public void flip(UserPrincipal user, String sessionId, String cardInstanceId) {
        MemorySession session = registry.requireById(sessionId);
        FlipOutcome outcome =
                session.withLock(() -> applyFlip(session, user.getUserId(), cardInstanceId));

        broadcaster.broadcast(session, outcome.eventType(), outcome.state());
        if (outcome.finished()) {
            completeSession(session, outcome.state());
            return;
        }
        if (outcome.scheduleResolve()) {
            scheduleMismatchResolve(session);
        }
        if (outcome.turnRestarted()) {
            scheduleTurnTimeout(session);
        }
    }

    private FlipOutcome applyFlip(MemorySession session, long userId, String cardInstanceId) {
        if (session.getStatus() != MemorySessionStatus.RUNNING) {
            throw new ApiException(ErrorCode.SESSION_FINISHED);
        }
        MemoryPlayerState player = requireParticipant(session, userId);
        if (!session.isMyTurn(userId)) {
            throw new ApiException(ErrorCode.NOT_YOUR_TURN);
        }
        if (session.isResolving()) {
            throw new ApiException(ErrorCode.INVALID_MOVE, "Đang chờ úp thẻ, thử lại ngay sau");
        }
        MemoryCard card = session.findCard(cardInstanceId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_MOVE, "Thẻ không tồn tại"));
        if (card.getState() != MemoryCardState.HIDDEN) {
            throw new ApiException(ErrorCode.INVALID_MOVE, "Thẻ này đã được mở");
        }

        Instant now = Instant.now(clock);
        card.setState(MemoryCardState.TEMP_REVEALED);
        session.getSelection().add(card.getCardInstanceId());

        // Thẻ đầu: mở và chờ thẻ thứ hai, chưa tính là một lượt lật.
        if (session.getSelection().size() == 1) {
            session.setFirstFlipAt(now);
            session.bumpVersion();
            return new FlipOutcome(MemoryEventType.CARD_REVEALED,
                    viewMapper.toStateView(session), false, false, false);
        }

        if (session.getFirstFlipAt() != null) {
            player.recordDecision(Duration.between(session.getFirstFlipAt(), now).toMillis());
        }
        session.incrementMoves();
        player.recordMove();

        MemoryCard first = session.findCard(session.getSelection().get(0))
                .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR));
        return first.getPairId() == card.getPairId()
                ? resolveMatch(session, player, first, card, now)
                : holdMismatch(session, player, first, card);
    }

    private FlipOutcome resolveMatch(MemorySession session, MemoryPlayerState player,
                                     MemoryCard first, MemoryCard second, Instant now) {
        for (MemoryCard card : List.of(first, second)) {
            card.setState(MemoryCardState.MATCHED);
            card.setMatchedByUserId(player.getUserId());
        }
        session.getSelection().clear();
        session.incrementPairsMatched();
        player.recordMatch();

        if (session.isBoardCleared()) {
            return finishInLock(session, MemoryOutcome.CLEARED);
        }
        if (session.isMoveBudgetExhausted()) {
            return finishInLock(session, MemoryOutcome.MOVES_EXHAUSTED);
        }

        // Ghép đúng: giữ lượt hoặc chuyển tiếp tuỳ cấu hình (p2-memory §6).
        boolean turnChanged = false;
        if (!session.getConfig().keepTurnOnMatch()) {
            session.setCurrentTurnUserId(session.nextTurnUserId());
            turnChanged = true;
        }
        session.startTurn(now);
        session.bumpVersion();
        return new FlipOutcome(
                turnChanged ? MemoryEventType.NEXT_TURN : MemoryEventType.PAIR_MATCHED,
                viewMapper.toStateView(session), false, false, true);
    }

    /** Cặp sai: giữ hai thẻ mở trong revealDelay để người chơi kịp ghi nhớ. */
    private FlipOutcome holdMismatch(MemorySession session, MemoryPlayerState player,
                                     MemoryCard first, MemoryCard second) {
        player.recordMistake();
        session.recordPairMistake(first.getPairId());
        session.recordPairMistake(second.getPairId());
        session.setResolving(true);
        session.bumpVersion();
        return new FlipOutcome(MemoryEventType.PAIR_MISMATCH,
                viewMapper.toStateView(session), true, false, false);
    }

    private record FlipOutcome(String eventType,
                               MemoryStateView state,
                               boolean scheduleResolve,
                               boolean finished,
                               boolean turnRestarted) {
    }

    // ===================== TIMER / KẾT VÁN =====================

    /** Úp lại cặp sai sau revealDelay rồi chuyển lượt. */
    private void scheduleMismatchResolve(MemorySession session) {
        Instant runAt = Instant.now(clock)
                .plusMillis(gameProperties.getMemory().getRevealDelayMs());
        replaceTask(resolveTasks, session.getSessionId(),
                taskScheduler.schedule(() -> hideMismatch(session), runAt));
    }

    private void hideMismatch(MemorySession session) {
        resolveTasks.remove(session.getSessionId());
        FlipOutcome outcome = session.withLock(() -> {
            if (session.getStatus() != MemorySessionStatus.RUNNING || !session.isResolving()) {
                return null;
            }
            hideSelection(session);
            session.setResolving(false);

            if (session.isMoveBudgetExhausted()) {
                return finishInLock(session, MemoryOutcome.MOVES_EXHAUSTED);
            }
            session.setCurrentTurnUserId(session.nextTurnUserId());
            session.startTurn(Instant.now(clock));
            session.bumpVersion();
            return new FlipOutcome(MemoryEventType.NEXT_TURN,
                    viewMapper.toStateView(session), false, false, true);
        });

        if (outcome == null) {
            return;
        }
        broadcaster.broadcast(session, outcome.eventType(), outcome.state());
        if (outcome.finished()) {
            completeSession(session, outcome.state());
        } else {
            scheduleTurnTimeout(session);
        }
    }

    /** Úp mọi thẻ đang TEMP_REVEALED của lượt hiện tại. Gọi trong lock. */
    private void hideSelection(MemorySession session) {
        for (String cardId : List.copyOf(session.getSelection())) {
            session.findCard(cardId).ifPresent(card -> {
                if (card.getState() == MemoryCardState.TEMP_REVEALED) {
                    card.setState(MemoryCardState.HIDDEN);
                }
            });
        }
        session.getSelection().clear();
    }

    /** Hết thời gian lượt: úp thẻ đang mở, mất lượt (p2-memory §7). */
    private void scheduleTurnTimeout(MemorySession session) {
        Instant deadline = session.withLock(session::getTurnDeadlineAt);
        if (deadline == null) {
            return;
        }
        replaceTask(turnTasks, session.getSessionId(),
                taskScheduler.schedule(() -> handleTurnTimeout(session, deadline), deadline));
    }

    private void handleTurnTimeout(MemorySession session, Instant expectedDeadline) {
        turnTasks.remove(session.getSessionId());
        FlipOutcome outcome = session.withLock(() -> {
            // Deadline đã đổi -> lượt này đã được xử lý bởi flip/resolve khác.
            if (session.getStatus() != MemorySessionStatus.RUNNING
                    || !expectedDeadline.equals(session.getTurnDeadlineAt())) {
                return null;
            }
            MemoryPlayerState player = session.playersByUserId().get(session.getCurrentTurnUserId());
            if (player != null && !session.getSelection().isEmpty()) {
                player.recordMistake();
            }
            hideSelection(session);
            session.setResolving(false);
            session.setCurrentTurnUserId(session.nextTurnUserId());
            session.startTurn(Instant.now(clock));
            session.bumpVersion();
            return new FlipOutcome(MemoryEventType.TURN_TIMEOUT,
                    viewMapper.toStateView(session), false, false, true);
        });

        if (outcome == null) {
            return;
        }
        broadcaster.broadcast(session, outcome.eventType(), outcome.state());
        scheduleTurnTimeout(session);
    }

    private void scheduleTotalTimeout(MemorySession session) {
        Instant deadline = session.withLock(session::getTotalDeadlineAt);
        if (deadline == null) {
            return;
        }
        replaceTask(totalTasks, session.getSessionId(),
                taskScheduler.schedule(() -> {
                    totalTasks.remove(session.getSessionId());
                    finishAndBroadcast(session, MemoryOutcome.TIME_UP);
                }, deadline));
    }

    /** Kết ván khi đang giữ lock; trả outcome để caller broadcast. */
    private FlipOutcome finishInLock(MemorySession session, MemoryOutcome outcome) {
        session.setStatus(MemorySessionStatus.FINISHED);
        session.setOutcome(outcome);
        session.setFinishedAt(Instant.now(clock));
        session.setResolving(false);
        session.bumpVersion();
        return new FlipOutcome(MemoryEventType.GAME_OVER,
                viewMapper.toStateView(session), false, true, false);
    }

    private void finishAndBroadcast(MemorySession session, MemoryOutcome outcome) {
        MemoryStateView state = session.withLock(() -> session.getStatus().isTerminal()
                ? null
                : finishInLock(session, outcome).state());
        if (state == null) {
            return;
        }
        broadcaster.broadcast(session, MemoryEventType.GAME_OVER, state);
        completeSession(session, state);
    }

    /** Dọn timer + persist. Session vẫn giữ trong registry để client xem kết quả. */
    private void completeSession(MemorySession session, MemoryStateView state) {
        cancelTasks(session.getSessionId());
        try {
            resultRecorder.recordFinish(session, state);
        } catch (Exception ex) {
            log.warn("Không ghi được kết quả memory session {}: {}",
                    session.getSessionId(), ex.getMessage());
        }
        log.info("Memory session {} kết thúc: {} ({}/{} cặp)", session.getSessionId(),
                session.getOutcome(), session.getPairsMatched(), session.getConfig().pairCount());
    }

    private void replaceTask(Map<String, ScheduledFuture<?>> holder, String sessionId,
                             ScheduledFuture<?> task) {
        ScheduledFuture<?> previous = holder.put(sessionId, task);
        if (previous != null) {
            previous.cancel(false);
        }
    }

    private void cancelTasks(String sessionId) {
        List.<Map<String, ScheduledFuture<?>>>of(resolveTasks, turnTasks, totalTasks)
                .forEach(holder -> {
                    ScheduledFuture<?> task = holder.remove(sessionId);
                    if (task != null) {
                        task.cancel(false);
                    }
                });
    }

    // ===================== KẾT NỐI / PAUSE =====================

    /** Đánh dấu offline; ván multiplayer vẫn chạy, không chặn người còn lại. */
    public void markDisconnected(long userId) {
        registry.currentSessionIdOf(userId)
                .flatMap(registry::findById)
                .ifPresent(session -> setConnected(session, userId, false));
    }

    public void markReconnected(long userId) {
        registry.currentSessionIdOf(userId)
                .flatMap(registry::findById)
                .ifPresent(session -> setConnected(session, userId, true));
    }

    private void setConnected(MemorySession session, long userId, boolean connected) {
        MemoryStateView state = session.withLock(() -> {
            MemoryPlayerState player = session.playersByUserId().get(userId);
            if (player == null || player.isConnected() == connected) {
                return null;
            }
            player.setConnected(connected);
            session.bumpVersion();
            return viewMapper.toStateView(session);
        });
        if (state != null) {
            broadcaster.broadcast(session, MemoryEventType.PLAYER_UPDATED, state);
        }
    }

    /** Solo được tạm dừng; multiplayer thì không, để không ai treo ván của người khác. */
    public MemoryStateView setPaused(UserPrincipal user, String sessionId, boolean paused) {
        MemorySession session = registry.requireById(sessionId);
        MemoryStateView state = session.withLock(() -> {
            requireParticipant(session, user.getUserId());
            if (!session.supportsPause()) {
                throw new ApiException(ErrorCode.INVALID_MOVE, "Chế độ này không thể tạm dừng");
            }
            Instant now = Instant.now(clock);
            if (paused) {
                if (session.getStatus() != MemorySessionStatus.RUNNING) {
                    throw new ApiException(ErrorCode.INVALID_MOVE, "Ván không đang chạy");
                }
                session.setStatus(MemorySessionStatus.PAUSED);
                session.setPausedAt(now);
            } else {
                if (session.getStatus() != MemorySessionStatus.PAUSED) {
                    throw new ApiException(ErrorCode.INVALID_MOVE, "Ván không đang tạm dừng");
                }
                Duration away = Duration.between(session.getPausedAt(), now);
                session.addPausedMs(away.toMillis());
                session.shiftDeadlines(away);
                session.setPausedAt(null);
                session.setStatus(MemorySessionStatus.RUNNING);
            }
            session.bumpVersion();
            return viewMapper.toStateView(session);
        });

        if (paused) {
            cancelTasks(sessionId);
        } else {
            scheduleTurnTimeout(session);
            scheduleTotalTimeout(session);
        }
        broadcaster.broadcast(session,
                paused ? MemoryEventType.PAUSED : MemoryEventType.RESUMED, state);
        return state;
    }

    /** Phòng huỷ/đóng giữa ván: dừng engine, không ghi kết quả xếp hạng. */
    public void abortByRoom(String roomId) {
        registry.snapshotAll().stream()
                .filter(session -> roomId.equals(session.getRoomId()))
                .forEach(session -> {
                    MemoryStateView state = session.withLock(() -> {
                        if (session.getStatus().isTerminal()) {
                            return null;
                        }
                        session.setStatus(MemorySessionStatus.ABORTED);
                        session.setOutcome(MemoryOutcome.ABANDONED);
                        session.setFinishedAt(Instant.now(clock));
                        session.bumpVersion();
                        return viewMapper.toStateView(session);
                    });
                    cancelTasks(session.getSessionId());
                    if (state != null) {
                        broadcaster.broadcast(session, MemoryEventType.GAME_OVER, state);
                    }
                    registry.remove(session);
                });
    }

    /** Dọn session cũ, gọi từ sweeper (rule.md §10 — không để rác in-memory). */
    public int sweepStaleSessions() {
        Instant threshold = Instant.now(clock)
                .minusSeconds(gameProperties.getMemory().getSessionIdleTimeoutMinutes() * 60L);
        int removed = 0;
        for (MemorySession session : registry.snapshotAll()) {
            boolean stale = session.withLock(() -> {
                Instant marker = session.getFinishedAt() != null
                        ? session.getFinishedAt()
                        : session.getCreatedAt();
                return marker.isBefore(threshold);
            });
            if (stale) {
                cancelTasks(session.getSessionId());
                registry.remove(session);
                removed++;
            }
        }
        return removed;
    }

    private MemoryPlayerState requireParticipant(MemorySession session, long userId) {
        MemoryPlayerState player = session.playersByUserId().get(userId);
        if (player == null) {
            throw new ApiException(ErrorCode.NOT_SESSION_PLAYER);
        }
        return player;
    }
}
