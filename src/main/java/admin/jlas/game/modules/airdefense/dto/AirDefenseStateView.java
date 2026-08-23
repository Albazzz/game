package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSessionStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AirDefenseStateView(
        String sessionId,
        String roomId,
        AirDefensePlayMode playMode,
        AirDefenseSessionStatus status,
        AirDefenseConfigView config,
        List<AirDefensePlayerView> players,
        List<AirDefenseAircraftView> aircraft,
        long stateVersion,
        Instant startedAt,
        Instant totalDeadlineAt,
        long elapsedMs,
        boolean ranked,
        AirDefenseResultView result,
        Instant serverTime) {
}
