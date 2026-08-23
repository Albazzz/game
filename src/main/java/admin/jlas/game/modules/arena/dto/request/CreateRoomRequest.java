package admin.jlas.game.modules.arena.dto.request;

import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomVisibility;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRoomRequest(
        @NotNull GameType gameType,
        RoomVisibility visibility,
        @Min(2) @Max(4) Integer maxPlayers,
        @Valid UpdateSettingsRequest settings) {
}
