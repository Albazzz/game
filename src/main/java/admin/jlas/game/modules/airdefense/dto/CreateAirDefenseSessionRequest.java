package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import jakarta.validation.Valid;

public record CreateAirDefenseSessionRequest(@Valid UpdateSettingsRequest settings) {
}
