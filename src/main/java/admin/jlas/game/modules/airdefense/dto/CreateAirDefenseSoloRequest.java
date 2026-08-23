package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;

public record CreateAirDefenseSoloRequest(
        QuestionLevel jlptLevel,
        AnswerMode answerMode,
        String shipId
) {
}
