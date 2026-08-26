package admin.jlas.game.modules.airdefense.dto;

public record AirDefenseLeaderboardItem(
        int rank,
        Long userId,
        String displayName,
        String shipId,
        String shipName,
        String shipTone,
        int score,
        int waveReached,
        int bestCombo,
        int accuracyPercent,
        String rankTier,
        boolean isCurrentUser
) {}
