package admin.jlas.game.modules.arena.dto.request;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.arena.domain.QuestionSource;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.Map;

/** Patch settings: field null = giữ nguyên. Whitelist enum chặn giá trị lạ. */
public record UpdateSettingsRequest(
        QuestionLevel questionLevel,
        QuestionSource questionSource,
        AnswerMode answerMode,
        @Min(5) @Max(60) Integer questionCount,
        @Min(5) @Max(60) Integer secondsPerQuestion,
        Map<String, Object> extra) {
}
