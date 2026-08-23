package admin.jlas.game.modules.airdefense.dto;

import admin.jlas.game.modules.airdefense.domain.AirDefenseDifficulty;
import admin.jlas.game.modules.airdefense.domain.AirDefenseObjective;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;

public record AirDefenseConfigView(
        AirDefenseObjective objective,
        AirDefenseDifficulty difficulty,
        AnswerMode answerMode,
        QuestionLevel level,
        int maxHp,
        int targetCorrect,
        int questionCount,
        int durationSeconds,
        int travelTimeMs,
        int spawnIntervalMs) {
}
