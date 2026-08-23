package admin.jlas.game.modules.airdefense.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AirDefenseEventPayload(
        AirDefenseStateView state,
        AirDefenseActionMeta action) {
}
