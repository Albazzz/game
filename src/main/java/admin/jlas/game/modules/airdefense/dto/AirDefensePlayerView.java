package admin.jlas.game.modules.airdefense.dto;

public record AirDefensePlayerView(
        long userId,
        String displayName,
        String avatar,
        int slot,
        int hp,
        int maxHp,
        int score,
        int combo,
        int bestCombo,
        int correctAnswers,
        int incorrectAnswers,
        int accuracyPercent,
        Integer averageResponseMs,
        boolean connected) {
}
