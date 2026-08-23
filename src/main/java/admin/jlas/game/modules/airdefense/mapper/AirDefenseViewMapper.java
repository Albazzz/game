package admin.jlas.game.modules.airdefense.mapper;

import admin.jlas.game.modules.airdefense.domain.AirDefenseAnswerRecord;
import admin.jlas.game.modules.airdefense.domain.AirDefenseConfig;
import admin.jlas.game.modules.airdefense.domain.AirDefenseOutcome;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayerState;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSessionStatus;
import admin.jlas.game.modules.airdefense.domain.Aircraft;
import admin.jlas.game.modules.airdefense.dto.AirDefenseAircraftView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseConfigView;
import admin.jlas.game.modules.airdefense.dto.AirDefensePlayerView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseResultView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/** Domain -> projection riêng cho từng người xem; không rò câu hỏi của đối thủ. */
@Component
public class AirDefenseViewMapper {

    private final Clock clock;

    public AirDefenseViewMapper(Clock clock) {
        this.clock = clock;
    }

    public AirDefenseStateView toState(AirDefenseSession session, long viewerUserId) {
        Instant now = Instant.now(clock);
        boolean terminal = session.getStatus().isTerminal();
        return new AirDefenseStateView(
                session.getSessionId(), session.getRoomId(), session.getPlayMode(),
                session.getStatus(), toConfig(session.getConfig()),
                session.orderedPlayers().stream().map(this::toPlayer).toList(),
                session.orderedAircraft().stream()
                        .map(item -> toAircraft(item, viewerUserId)).toList(),
                session.getStateVersion(), session.getStartedAt(),
                session.getTotalDeadlineAt(), session.elapsedMs(now), isRanked(session),
                terminal ? toResult(session, viewerUserId, now) : null, now);
    }

    private AirDefenseConfigView toConfig(AirDefenseConfig config) {
        return new AirDefenseConfigView(config.objective(), config.difficulty(),
                config.answerMode(), config.level(), config.maxHp(), config.targetCorrect(),
                config.questionCount(), config.durationSeconds(), config.travelTimeMs(),
                config.spawnIntervalMs());
    }

    private AirDefensePlayerView toPlayer(AirDefensePlayerState player) {
        return new AirDefensePlayerView(player.getUserId(), player.getDisplayName(),
                player.getAvatar(), player.getSlot(), player.getHp(), player.getMaxHp(),
                player.getScore(), player.getCombo(), player.getBestCombo(),
                player.getCorrectAnswers(), player.getIncorrectAnswers(),
                player.accuracyPercent(), player.averageResponseMs(), player.isConnected());
    }

    private AirDefenseAircraftView toAircraft(Aircraft item, long viewerUserId) {
        boolean ownsQuestion = item.getTargetUserId() == viewerUserId;
        return new AirDefenseAircraftView(
                item.getAircraftId(),
                ownsQuestion ? item.getQuestion().questionId() : null,
                ownsQuestion ? item.getQuestion().questionText() : null,
                ownsQuestion ? item.getQuestion().questionType() : null,
                item.getSpawnAt(), item.getImpactAt(), item.getDifficulty(),
                item.getAircraftType(), item.getTargetUserId(), item.getRouteIndex(),
                item.getState(), item.getResolvedAt(), item.getResolvedByUserId());
    }

    private AirDefenseResultView toResult(AirDefenseSession session, long viewerUserId,
                                          Instant now) {
        AirDefensePlayerState viewer = session.playersByUserId().get(viewerUserId);
        List<AirDefenseResultView.AirDefenseReviewItem> review = viewer == null
                ? List.of()
                : viewer.getAnswerHistory().stream()
                    .filter(record -> !record.correct())
                    .sorted(Comparator.comparing(AirDefenseAnswerRecord::answeredAt).reversed())
                    .limit(8)
                    .map(record -> new AirDefenseResultView.AirDefenseReviewItem(
                            record.questionText(), record.expectedAnswer(),
                            record.submittedAnswer(), record.correct(), record.responseMs()))
                    .toList();
        AirDefenseOutcome viewerOutcome = viewerOutcome(session, viewerUserId);
        boolean success = viewerOutcome == AirDefenseOutcome.CHALLENGE_COMPLETE
                || viewerOutcome == AirDefenseOutcome.VICTORY;
        return new AirDefenseResultView(success, isRanked(session),
                session.getWinnerUserId(), session.isDraw(), viewerOutcome,
                session.elapsedMs(now), session.isPersonalBest(viewerUserId), review);
    }

    private AirDefenseOutcome viewerOutcome(AirDefenseSession session, long viewerUserId) {
        if (session.getPlayMode() == AirDefensePlayMode.SOLO) {
            return session.getOutcome();
        }
        if (session.isDraw()) return AirDefenseOutcome.DRAW;
        return session.getWinnerUserId() != null && session.getWinnerUserId() == viewerUserId
                ? AirDefenseOutcome.VICTORY : AirDefenseOutcome.DEFEAT;
    }

    private boolean isRanked(AirDefenseSession session) {
        return session.getRoomId() != null && session.playersByUserId().size() == 2;
    }
}
