package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefenseDifficulty;
import admin.jlas.game.modules.airdefense.domain.AircraftState;
import admin.jlas.game.modules.airdefense.domain.AircraftType;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AirDefenseAircraftView(
        String aircraftId,
        Long questionId,
        String questionText,
        AnswerMode questionType,
        Instant spawnAt,
        Instant impactAt,
        AirDefenseDifficulty difficulty,
        AircraftType aircraftType,
        long targetUserId,
        int routeIndex,
        AircraftState state,
        Instant resolvedAt,
        Long resolvedByUserId) {
}
