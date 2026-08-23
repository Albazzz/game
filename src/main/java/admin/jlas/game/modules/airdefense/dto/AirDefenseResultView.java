package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefenseOutcome;

import java.util.List;

public record AirDefenseResultView(
        boolean success,
        boolean ranked,
        Long winnerUserId,
        boolean draw,
        AirDefenseOutcome viewerOutcome,
        long durationMs,
        boolean personalBest,
        List<AirDefenseReviewItem> review) {

    public record AirDefenseReviewItem(
            String questionText,
            String expectedAnswer,
            String submittedAnswer,
            boolean correct,
            long responseMs) {
    }
}
