package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseEventType;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayerState;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSessionStatus;
import admin.jlas.game.modules.airdefense.domain.AirDefenseTarget;
import admin.jlas.game.modules.airdefense.domain.AugmentType;
import admin.jlas.game.modules.airdefense.dto.AirDefenseAnswerRequest;
import admin.jlas.game.modules.airdefense.dto.AirDefensePlayerView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseTargetView;
import admin.jlas.game.modules.airdefense.dto.CreateAirDefenseSoloRequest;
import admin.jlas.game.modules.airdefense.dto.SelectAugmentRequest;
import admin.jlas.game.modules.airdefense.dto.WeakWordReviewItem;
import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import admin.jlas.game.modules.airdefense.model.UserPermanentUpgrade;
import admin.jlas.game.modules.airdefense.repository.AirDefenseResultRepository;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseBroadcaster;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseSessionRegistry;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.model.GameMatch;
import admin.jlas.game.modules.arena.repository.GameMatchRepository;
import admin.jlas.game.modules.auth.model.User;
import admin.jlas.game.modules.auth.repository.UserRepository;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.validation.JapaneseAnswerValidationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AirDefenseService {

    private static final Logger log = LoggerFactory.getLogger(AirDefenseService.class);

    private final AirDefenseSessionRegistry sessionRegistry;
    private final AirDefenseBroadcaster broadcaster;
    private final AirDefenseWaveManager waveManager;
    private final AirDefenseShopService shopService;
    private final JapaneseAnswerValidationService validationService;
    private final AirDefenseResultRepository resultRepository;
    private final GameMatchRepository matchRepository;
    private final UserRepository userRepository;

    public AirDefenseService(AirDefenseSessionRegistry sessionRegistry,
                             AirDefenseBroadcaster broadcaster,
                             AirDefenseWaveManager waveManager,
                             AirDefenseShopService shopService,
                             JapaneseAnswerValidationService validationService,
                             AirDefenseResultRepository resultRepository,
                             GameMatchRepository matchRepository,
                             UserRepository userRepository) {
        this.sessionRegistry = sessionRegistry;
        this.broadcaster = broadcaster;
        this.waveManager = waveManager;
        this.shopService = shopService;
        this.validationService = validationService;
        this.resultRepository = resultRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
    }

    public AirDefenseSession createSoloSession(UserPrincipal principal, CreateAirDefenseSoloRequest req) {
        String sessionId = "air_solo_" + UUID.randomUUID().toString().substring(0, 8);
        QuestionLevel level = req.jlptLevel() != null ? req.jlptLevel() : QuestionLevel.N5;
        AnswerMode mode = req.answerMode() != null ? req.answerMode() : AnswerMode.KANJI_TO_HIRAGANA;

        UserPermanentUpgrade upgrade = shopService.getOrCreateUpgrade(principal.getUserId());
        int baseHp = 100 + (upgrade.getExtraBaseHpLevel() * 15);
        int rerolls = 3 + upgrade.getRerollCountLevel();

        AirDefensePlayerState playerState = AirDefensePlayerState.builder()
                .userId(principal.getUserId())
                .username(principal.getUsername())
                .displayName(principal.getDisplayName())
                .avatarUrl(principal.getAvatar())
                .hp(baseHp)
                .maxHp(baseHp)
                .shield(0)
                .remainingRerolls(rerolls)
                .equippedShipId(upgrade.getEquippedShipId())
                .build();

        if (upgrade.getFastStartLevel() > 0) {
            List<AugmentType> starter = waveManager.rollAugments(List.of(), List.of());
            if (!starter.isEmpty()) {
                playerState.getActiveAugments().add(starter.get(0));
            }
        }

        AirDefenseSession session = AirDefenseSession.builder()
                .sessionId(sessionId)
                .playMode("SOLO")
                .ranked(false)
                .jlptLevel(level)
                .answerMode(mode)
                .wave(1)
                .status(AirDefenseSessionStatus.PLAYING)
                .createdAt(LocalDateTime.now())
                .startedAt(LocalDateTime.now())
                .build();

        session.getPlayers().put(principal.getUserId(), playerState);
        session.getTargets().addAll(waveManager.generateWaveTargets(1, level));

        sessionRegistry.register(session);
        return session;
    }

    public AirDefenseSession createForRoom(String roomId, Long matchId, GameSettings settings, List<RoomPlayer> players) {
        String sessionId = "air_room_" + UUID.randomUUID().toString().substring(0, 8);
        QuestionLevel level = settings.questionLevel() != null ? settings.questionLevel() : QuestionLevel.N5;
        AnswerMode mode = settings.answerMode() != null ? settings.answerMode() : AnswerMode.KANJI_TO_HIRAGANA;

        AirDefenseSession session = AirDefenseSession.builder()
                .sessionId(sessionId)
                .roomId(roomId)
                .matchId(matchId)
                .playMode("PVP")
                .ranked(true)
                .jlptLevel(level)
                .answerMode(mode)
                .wave(1)
                .status(AirDefenseSessionStatus.PLAYING)
                .createdAt(LocalDateTime.now())
                .startedAt(LocalDateTime.now())
                .build();

        for (RoomPlayer rp : players) {
            UserPermanentUpgrade upgrade = shopService.getOrCreateUpgrade(rp.getUserId());
            int baseHp = 100 + (upgrade.getExtraBaseHpLevel() * 15);
            int rerolls = 3 + upgrade.getRerollCountLevel();

            AirDefensePlayerState ps = AirDefensePlayerState.builder()
                    .userId(rp.getUserId())
                    .username(rp.getDisplayName())
                    .displayName(rp.getDisplayName())
                    .avatarUrl(rp.getAvatar())
                    .hp(baseHp)
                    .maxHp(baseHp)
                    .shield(0)
                    .remainingRerolls(rerolls)
                    .equippedShipId(upgrade.getEquippedShipId())
                    .build();

            session.getPlayers().put(rp.getUserId(), ps);
        }

        session.getTargets().addAll(waveManager.generateWaveTargets(1, level));
        sessionRegistry.register(session);
        return session;
    }

    public AirDefenseStateView getState(UserPrincipal principal, String sessionId) {
        AirDefenseSession session = sessionRegistry.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND, "Không tìm thấy session " + sessionId));

        Long myId = principal.getUserId();
        AirDefensePlayerState myState = session.getPlayer(myId);
        if (myState == null && !session.getPlayers().isEmpty()) {
            myState = session.getPlayerList().get(0);
        }

        AirDefensePlayerState opponentState = null;
        for (AirDefensePlayerState ps : session.getPlayerList()) {
            if (!ps.getUserId().equals(myId)) {
                opponentState = ps;
                break;
            }
        }

        return toStateView(session, myState, opponentState);
    }

    @Transactional
    public synchronized void processAnswer(UserPrincipal principal, String sessionId, AirDefenseAnswerRequest req) {
        AirDefenseSession session = sessionRegistry.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND, "Không tìm thấy session " + sessionId));

        if (session.getStatus() != AirDefenseSessionStatus.PLAYING) {
            return;
        }

        AirDefensePlayerState player = session.getPlayer(principal.getUserId());
        if (player == null || player.isEliminated()) {
            return;
        }

        String rawInput = req.rawInput();
        AirDefenseTarget matchedTarget = null;

        // Auto-target: Tìm xem từ gõ có match với bất kỳ target nào đang sống không
        for (AirDefenseTarget target : session.getTargets()) {
            if (target.isDead()) continue;

            JapaneseAnswerValidationService.ValidationResult result =
                    validationService.validate(rawInput, target.getReading(), target.getAliases(), session.getAnswerMode());

            if (result.correct()) {
                matchedTarget = target;
                break;
            }
        }

        if (matchedTarget != null) {
            // Match thành công! Tiêu diệt quái vật
            matchedTarget.setDead(true);
            player.setCorrectAnswers(player.getCorrectAnswers() + 1);
            player.incrementCombo();

            int baseScore = 150 * session.getWave();
            if (player.getActiveAugments().contains(AugmentType.DUAL_CANNON)) {
                baseScore = (int) (baseScore * 1.5);
            }
            player.addScore(baseScore);

            int earnedCoins = 5 + (session.getWave() * 2);
            if (player.getActiveAugments().contains(AugmentType.GOLD_MAGNET)) {
                earnedCoins = (int) (earnedCoins * 1.5);
            }
            player.setCreditsEarned(player.getCreditsEarned() + earnedCoins);

            // Bắn event nổ quái
            broadcaster.broadcast(sessionId, AirDefenseEventType.TARGET_DESTROYED, java.util.Map.of(
                    "targetId", matchedTarget.getId(),
                    "userId", player.getUserId(),
                    "scoreAdded", baseScore,
                    "combo", player.getCombo(),
                    "hyperBeamCharge", player.getHyperBeamCharge()
            ));

            // PVP Disruption Attack Check
            if ("PVP".equals(session.getPlayMode()) && (player.getCombo() == 10 || player.getCombo() == 15 || player.getCombo() == 20)) {
                AirDefenseTarget miniBoss = waveManager.generateDisruptionMiniBoss(session.getJlptLevel());
                session.addTarget(miniBoss);
                broadcaster.broadcast(sessionId, AirDefenseEventType.DISRUPTION_ATTACK, java.util.Map.of(
                        "attackerName", player.getDisplayName(),
                        "comboStreak", player.getCombo(),
                        "bossTarget", miniBoss
                ));
            }

            // Kiểm tra quét sạch wave
            boolean allDead = session.getTargets().stream().allMatch(AirDefenseTarget::isDead);
            if (allDead) {
                advanceWave(session);
            }
        } else {
            // Gõ sai
            player.setIncorrectAnswers(player.getIncorrectAnswers() + 1);
            player.resetCombo();
            broadcaster.sendToUser(principal.getUsername(), sessionId, AirDefenseEventType.ERROR,
                    java.util.Map.of("message", "Từ vựng chưa chính xác"));
        }

        session.removeDeadTargets();
        broadcastSessionState(session);
    }

    private void advanceWave(AirDefenseSession session) {
        session.setWave(session.getWave() + 1);

        // Sau mỗi 3 wave -> kích hoạt Augment Draft
        if (session.getWave() % 3 == 0) {
            session.setStatus(AirDefenseSessionStatus.AUGMENT_DRAFT);
            List<AugmentType> draft = waveManager.rollAugments(List.of(), List.of());
            session.getCurrentDraftAugments().clear();
            session.getCurrentDraftAugments().addAll(draft);

            broadcaster.broadcast(session.getSessionId(), AirDefenseEventType.AUGMENT_DRAFT_TRIGGERED, java.util.Map.of(
                    "wave", session.getWave(),
                    "augments", draft
            ));
        } else {
            // Tiếp tục wave mới
            session.getTargets().clear();
            session.getTargets().addAll(waveManager.generateWaveTargets(session.getWave(), session.getJlptLevel()));
        }
    }

    @Transactional
    public synchronized void selectAugment(UserPrincipal principal, String sessionId, SelectAugmentRequest req) {
        AirDefenseSession session = sessionRegistry.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND, "Không tìm thấy session " + sessionId));

        AirDefensePlayerState player = session.getPlayer(principal.getUserId());
        if (player == null) return;

        if (req.isReroll()) {
            if (player.getRemainingRerolls() <= 0) {
                broadcaster.sendError(principal.getUsername(), sessionId, "Đã hết lượt Reroll");
                return;
            }
            player.setRemainingRerolls(player.getRemainingRerolls() - 1);
            List<AugmentType> newDraft = waveManager.rollAugments(session.getCurrentDraftAugments(), player.getActiveAugments());
            session.getCurrentDraftAugments().clear();
            session.getCurrentDraftAugments().addAll(newDraft);

            broadcaster.broadcast(sessionId, AirDefenseEventType.AUGMENT_REROLLED, java.util.Map.of(
                    "remainingRerolls", player.getRemainingRerolls(),
                    "augments", newDraft
            ));
            return;
        }

        if (req.augmentType() != null) {
            player.getActiveAugments().add(req.augmentType());
            // Kích hoạt buff tức thời nếu có
            if (req.augmentType() == AugmentType.REPAIR_NANO) {
                player.setHp(Math.min(player.getMaxHp(), (int) (player.getHp() + player.getMaxHp() * 0.3)));
            } else if (req.augmentType() == AugmentType.SHIELD_BARRIER) {
                player.setShield(player.getShield() + 3);
            }

            // Tiếp tục trận đấu
            session.setStatus(AirDefenseSessionStatus.PLAYING);
            session.getTargets().clear();
            session.getTargets().addAll(waveManager.generateWaveTargets(session.getWave(), session.getJlptLevel()));

            broadcaster.broadcast(sessionId, AirDefenseEventType.AUGMENT_SELECTED, java.util.Map.of(
                    "userId", player.getUserId(),
                    "selectedAugment", req.augmentType()
            ));
            broadcastSessionState(session);
        }
    }

    @Transactional
    public synchronized void triggerHyperBeam(UserPrincipal principal, String sessionId) {
        AirDefenseSession session = sessionRegistry.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND, "Không tìm thấy session " + sessionId));

        AirDefensePlayerState player = session.getPlayer(principal.getUserId());
        if (player == null || player.getHyperBeamCharge() < 100) {
            return;
        }

        player.setHyperBeamCharge(0);
        for (AirDefenseTarget t : session.getTargets()) {
            t.setDead(true);
        }

        broadcaster.broadcast(sessionId, AirDefenseEventType.HYPER_BEAM_FIRED, java.util.Map.of(
                "userId", player.getUserId(),
                "message", "HYPER BEAM QUÉT SẠCH TOÀN BỘ QUÁI VẬT!"
        ));

        advanceWave(session);
        broadcastSessionState(session);
    }

    @Transactional
    public synchronized void applyPlanetDamage(String sessionId, Long userId, int damageAmount) {
        AirDefenseSession session = sessionRegistry.findById(sessionId).orElse(null);
        if (session == null || session.getStatus() != AirDefenseSessionStatus.PLAYING) return;

        AirDefensePlayerState player = session.getPlayer(userId);
        if (player == null) return;

        player.takeDamage(damageAmount);
        broadcaster.broadcast(sessionId, AirDefenseEventType.PLAYER_DAMAGED, java.util.Map.of(
                "userId", userId,
                "remainingHp", player.getHp(),
                "shield", player.getShield()
        ));

        if (player.isEliminated()) {
            finishSession(session, "SOLO".equals(session.getPlayMode()) ? null : getOtherPlayerId(session, userId));
        } else {
            broadcastSessionState(session);
        }
    }

    @Transactional
    public synchronized void finishSession(AirDefenseSession session, Long winnerUserId) {
        if (session.getStatus() == AirDefenseSessionStatus.FINISHED) return;

        session.setStatus(AirDefenseSessionStatus.FINISHED);
        session.setFinishedAt(LocalDateTime.now());
        session.setWinnerUserId(winnerUserId);

        for (AirDefensePlayerState ps : session.getPlayerList()) {
            shopService.addCoins(ps.getUserId(), ps.getCreditsEarned());

            User user = userRepository.findById(ps.getUserId()).orElse(null);
            GameMatch match = session.getMatchId() != null ? matchRepository.findById(session.getMatchId()).orElse(null) : null;

            int totalAns = ps.getCorrectAnswers() + ps.getIncorrectAnswers();
            int accuracy = totalAns > 0 ? (ps.getCorrectAnswers() * 100 / totalAns) : 0;
            boolean isWinner = winnerUserId != null && winnerUserId.equals(ps.getUserId());

            AirDefenseResult result = AirDefenseResult.builder()
                    .sessionId(session.getSessionId())
                    .match(match)
                    .roomId(session.getRoomId())
                    .user(user)
                    .playMode(session.getPlayMode())
                    .objective("SURVIVAL")
                    .difficulty(session.getJlptLevel().name())
                    .answerMode(session.getAnswerMode().name())
                    .jlptLevel(session.getJlptLevel().name())
                    .outcome(isWinner ? "VICTORY" : (winnerUserId == null ? "FINISHED" : "DEFEAT"))
                    .hpRemaining(ps.getHp())
                    .score(ps.getScore())
                    .questionsAnswered(totalAns)
                    .correctAnswers(ps.getCorrectAnswers())
                    .incorrectAnswers(ps.getIncorrectAnswers())
                    .accuracyPercent(accuracy)
                    .bestCombo(ps.getBestCombo())
                    .durationMs(java.time.Duration.between(session.getStartedAt(), session.getFinishedAt()).toMillis())
                    .ranked(session.isRanked())
                    .winner(isWinner)
                    .finishedAt(LocalDateTime.now())
                    .build();

            resultRepository.save(result);
        }

        broadcaster.broadcast(session.getSessionId(), AirDefenseEventType.SESSION_FINISHED, java.util.Map.of(
                "winnerUserId", winnerUserId != null ? winnerUserId : -1,
                "waveReached", session.getWave()
        ));
        broadcastSessionState(session);
    }

    public void abortByRoom(String roomId) {
        sessionRegistry.findByRoomId(roomId).ifPresent(session -> {
            session.setStatus(AirDefenseSessionStatus.ABORTED);
            broadcaster.broadcast(session.getSessionId(), AirDefenseEventType.SESSION_FINISHED, java.util.Map.of(
                    "reason", "Phòng đã bị hủy"
            ));
            sessionRegistry.remove(session.getSessionId());
        });
    }

    public int sweepStaleSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        int removed = 0;
        for (AirDefenseSession session : sessionRegistry.all()) {
            LocalDateTime marker = session.getFinishedAt() != null
                    ? session.getFinishedAt()
                    : session.getCreatedAt();
            if (marker != null && marker.isBefore(threshold)) {
                sessionRegistry.remove(session.getSessionId());
                removed++;
            }
        }
        return removed;
    }

    public void markReconnected(Long userId) {
        log.debug("User {} reconnected to Air Defense", userId);
    }

    public void markDisconnected(Long userId) {
        log.debug("User {} disconnected from Air Defense", userId);
    }

    private void broadcastSessionState(AirDefenseSession session) {
        for (AirDefensePlayerState ps : session.getPlayerList()) {
            AirDefensePlayerState opp = null;
            for (AirDefensePlayerState o : session.getPlayerList()) {
                if (!o.getUserId().equals(ps.getUserId())) {
                    opp = o;
                    break;
                }
            }
            broadcaster.sendToUser(ps.getUsername(), session.getSessionId(),
                    AirDefenseEventType.SESSION_STATE, toStateView(session, ps, opp));
        }
    }

    private AirDefenseStateView toStateView(AirDefenseSession s, AirDefensePlayerState me, AirDefensePlayerState opp) {
        List<AirDefenseTargetView> targetViews = s.getTargets().stream()
                .filter(t -> !t.isDead())
                .map(t -> new AirDefenseTargetView(
                        t.getId(), t.getTerm(), t.getReading(), t.getMeaning(),
                        t.getType(), t.getPosX(), t.getPosY(), t.getSpeed(),
                        t.getMaxHp(), t.getCurrentHp()
                )).toList();

        AirDefensePlayerView myView = me != null ? toPlayerView(me) : null;
        AirDefensePlayerView oppView = opp != null ? toPlayerView(opp) : null;

        List<WeakWordReviewItem> reviewItems = new ArrayList<>();
        if (s.getStatus() == AirDefenseSessionStatus.FINISHED && me != null) {
            reviewItems.add(new WeakWordReviewItem("約束", "やくそく", "lời hứa", "Phản xạ 2.8s"));
            reviewItems.add(new WeakWordReviewItem("病院", "びょういん", "bệnh viện", "Gõ sai 1 lần"));
            reviewItems.add(new WeakWordReviewItem("準備", "じゅんび", "chuẩn bị", "Phản xạ 2.4s"));
        }

        return new AirDefenseStateView(
                s.getSessionId(),
                s.getRoomId(),
                s.getMatchId(),
                s.getPlayMode(),
                s.isRanked(),
                s.getJlptLevel().name(),
                s.getAnswerMode().name(),
                s.getWave(),
                s.getStatus(),
                myView,
                oppView,
                targetViews,
                s.getCurrentDraftAugments(),
                reviewItems,
                s.getWinnerUserId(),
                System.currentTimeMillis()
        );
    }

    private AirDefensePlayerView toPlayerView(AirDefensePlayerState ps) {
        return new AirDefensePlayerView(
                ps.getUserId(),
                ps.getUsername(),
                ps.getDisplayName(),
                ps.getAvatarUrl(),
                ps.getHp(),
                ps.getMaxHp(),
                ps.getShield(),
                ps.getScore(),
                ps.getCombo(),
                ps.getBestCombo(),
                ps.getCreditsEarned(),
                ps.getHyperBeamCharge(),
                ps.getRemainingRerolls(),
                ps.getEquippedShipId(),
                ps.getActiveAugments(),
                ps.isEliminated()
        );
    }

    private Long getOtherPlayerId(AirDefenseSession session, Long myUserId) {
        for (AirDefensePlayerState ps : session.getPlayerList()) {
            if (!ps.getUserId().equals(myUserId)) {
                return ps.getUserId();
            }
        }
        return null;
    }
}
