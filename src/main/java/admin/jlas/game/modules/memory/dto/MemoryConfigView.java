package admin.jlas.game.modules.memory.dto;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.memory.domain.MemoryObjective;
import com.fasterxml.jackson.annotation.JsonInclude;

/** Cấu hình ván gửi cho client để render HUD; không chứa dữ liệu bí mật. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemoryConfigView(
        int boardSize,
        int pairCount,
        MemoryObjective objective,
        AnswerMode pairMode,
        QuestionLevel level,
        int turnSeconds,
        Integer totalSeconds,
        Integer moveLimit,
        boolean keepTurnOnMatch,
        int revealDelayMs) {
}
