package admin.jlas.game.modules.memory.dto;

import admin.jlas.game.modules.memory.domain.MemoryCardFace;
import admin.jlas.game.modules.memory.domain.MemoryCardState;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Projection an toàn của một thẻ: thẻ HIDDEN chỉ có id + position, không có
 * content, không có pairId (p2-memory §14).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemoryCardView(
        String cardInstanceId,
        int position,
        MemoryCardState state,
        MemoryCardFace face,
        String content,
        Long matchedByUserId) {
}
