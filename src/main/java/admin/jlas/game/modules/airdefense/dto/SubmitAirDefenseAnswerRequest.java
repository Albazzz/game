package admin.jlas.game.modules.airdefense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitAirDefenseAnswerRequest(
        @NotBlank @Size(max = 64) String aircraftId,
        @NotBlank @Size(max = 255) String answer,
        @Size(max = 80) String commandId) {
}
