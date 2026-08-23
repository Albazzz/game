package admin.jlas.game.modules.arena.dto.response;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.arena.domain.QuestionSource;

import java.util.Map;

public record GameSettingsView(
        QuestionLevel questionLevel,
        QuestionSource questionSource,
        AnswerMode answerMode,
        Integer questionCount,
        Integer secondsPerQuestion,
        Map<String, Object> extra) {
}
