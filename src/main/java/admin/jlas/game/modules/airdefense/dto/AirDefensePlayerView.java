package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AugmentType;

import java.util.List;

public record AirDefensePlayerView(
        Long userId,
        String username,
        String displayName,
        String avatarUrl,
        int hp,
        int maxHp,
        int shield,
        int score,
        int combo,
        int bestCombo,
        int creditsEarned,
        int hyperBeamCharge,
        int remainingRerolls,
        String equippedShipId,
        List<AugmentType> activeAugments,
        boolean isEliminated
) {
}
