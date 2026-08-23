package admin.jlas.game.modules.arena.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Join bằng room code (dạng ABCD-1234). */
public record JoinByCodeRequest(
        @NotBlank
        @Size(min = 4, max = 12)
        @Pattern(regexp = "^[A-Za-z0-9-]{4,12}$", message = "Mã phòng chỉ gồm chữ, số và dấu gạch ngang")
        String roomCode) {
}
