package admin.jlas.game.modules.airdefense.dto;

import jakarta.validation.constraints.NotBlank;

public record AirDefenseAnswerRequest(
        String targetId,
        @NotBlank(message = "Đáp án không được để trống")
        String rawInput,
        Long clientTimestamp
) {
}
