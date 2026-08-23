package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.model.AirDefenseSpaceship;

import java.util.List;

public record AirDefenseShopView(
        int coinsBalance,
        String equippedShipId,
        int extraBaseHpLevel,
        int coinBonusLevel,
        int rerollCountLevel,
        int fastStartLevel,
        List<ShipItemView> ships
) {
    public record ShipItemView(
            String shipId,
            String name,
            String role,
            String description,
            int priceCoins,
            int baseHp,
            double speedMult,
            String passiveSkillCode,
            String colorTheme,
            boolean owned,
            boolean equipped
    ) {
    }
}
