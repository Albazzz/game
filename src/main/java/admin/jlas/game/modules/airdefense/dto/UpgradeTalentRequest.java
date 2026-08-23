package admin.jlas.game.modules.airdefense.dto;

public record UpgradeTalentRequest(
        String talentType // "HULL", "COIN", "REROLL", "FAST_START"
) {
}
