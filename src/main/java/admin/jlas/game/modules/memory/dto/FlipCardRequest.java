package admin.jlas.game.modules.memory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Ý định lật thẻ. Client chỉ gửi id thẻ, không gửi kết quả (rule.md §9). */
public record FlipCardRequest(
        @NotBlank(message = "Thiếu thẻ cần lật")
        @Size(max = 64, message = "Mã thẻ không hợp lệ")
        String cardInstanceId) {
}
