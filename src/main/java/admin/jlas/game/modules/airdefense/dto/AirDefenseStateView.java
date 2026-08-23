package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefenseSessionStatus;
import admin.jlas.game.modules.airdefense.domain.AugmentType;

import java.util.List;

public record AirDefenseStateView(
        String sessionId,
        String roomId,
        Long matchId,
        String playMode,
        boolean ranked,
        String jlptLevel,
        String answerMode,
        int wave,
        AirDefenseSessionStatus status,
        AirDefensePlayerView me,
        AirDefensePlayerView opponent,
        List<AirDefenseTargetView> targets,
        List<AugmentType> draftAugments,
        List<WeakWordReviewItem> reviewItems,
        Long winnerUserId,
        long serverTimestamp
) {
}
