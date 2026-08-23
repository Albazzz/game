package admin.jlas.game.modules.memory.dto;

import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import jakarta.validation.Valid;

/**
 * Tạo ván solo. Dùng lại {@link UpdateSettingsRequest} để cấu hình solo và cấu hình
 * phòng đi qua đúng một bộ validate; phần riêng của Memory nằm trong {@code settings.extra}
 * (boardSize, objective, turnSeconds, totalSeconds, moveLimit, keepTurnOnMatch).
 */
public record CreateMemorySessionRequest(@Valid UpdateSettingsRequest settings) {
}
