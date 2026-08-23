package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefenseTargetType;

public record AirDefenseTargetView(
        String id,
        String term,
        String reading,
        String meaning,
        AirDefenseTargetType type,
        double posX,
        double posY,
        double speed,
        int maxHp,
        int currentHp
) {
}
