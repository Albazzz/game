package admin.jlas.game.modules.airdefense.domain;

import java.time.Instant;

public record AirDefenseAnswerRecord(
        long questionId,
        String questionText,
        String expectedAnswer,
        String submittedAnswer,
        boolean correct,
        long responseMs,
        Instant answeredAt) {
}
