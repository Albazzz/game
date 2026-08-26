package admin.jlas.game.modules.airdefense.dto;

public record AirDefenseFinishMatchRequest(
        int score,
        int wave,
        int bestCombo,
        int creditsEarned,
        long durationMs,
        int questionsAnswered,
        int correctAnswers,
        int incorrectAnswers,
        int accuracyPercent,
        String playMode,
        String difficulty
) {
}
