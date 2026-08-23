package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AugmentType;

public record SelectAugmentRequest(
        int waveIndex,
        AugmentType augmentType,
        boolean isReroll
) {
}
