package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.validation.JapaneseAnswerValidationService.MatchKind;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AirDefenseActionMeta(
        String aircraftId,
        Long actorUserId,
        Boolean correct,
        MatchKind matchKind) {

    public static AirDefenseActionMeta aircraft(String aircraftId, Long actorUserId) {
        return new AirDefenseActionMeta(aircraftId, actorUserId, null, null);
    }
}
