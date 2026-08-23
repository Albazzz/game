package admin.jlas.game.modules.memory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Màn kết quả (p2-memory §15). Danh sách từ chỉ được gửi khi ván đã kết thúc,
 * nên không rò đáp án giữa ván.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemoryResultView(
        boolean success,
        boolean ranked,
        Long winnerUserId,
        boolean draw,
        long durationMs,
        List<MemoryTermView> termsEncountered,
        List<MemoryTermView> strugglingTerms) {

    public record MemoryTermView(String term, String reading, String meaning, int mistakes) {
    }
}
