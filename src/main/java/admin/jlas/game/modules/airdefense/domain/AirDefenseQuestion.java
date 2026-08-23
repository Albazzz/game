package admin.jlas.game.modules.airdefense.domain;

import admin.jlas.game.modules.arena.domain.AnswerMode;

import java.util.List;

/** Câu hỏi server-only; expectedAnswer/aliases không bao giờ serialize ra snapshot đang chạy. */
public record AirDefenseQuestion(
        long questionId,
        String questionText,
        AnswerMode questionType,
        String expectedAnswer,
        List<String> aliases) {
}
