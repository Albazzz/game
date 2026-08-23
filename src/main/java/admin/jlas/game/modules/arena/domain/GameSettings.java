package admin.jlas.game.modules.arena.domain;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Cấu hình phòng — phần common cố định, phần {@code extra} mở rộng cho từng game
 * ở các phase sau (p1.md §3).
 */
public record GameSettings(
        QuestionLevel questionLevel,
        QuestionSource questionSource,
        AnswerMode answerMode,
        Integer questionCount,
        Integer secondsPerQuestion,
        Map<String, Object> extra) {

    public static final int MIN_QUESTION_COUNT = 5;
    public static final int MAX_QUESTION_COUNT = 60;
    public static final int MIN_SECONDS_PER_QUESTION = 5;
    public static final int MAX_SECONDS_PER_QUESTION = 60;

    public GameSettings {
        extra = extra == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(extra));
    }

    public static GameSettings defaultsFor(GameType gameType) {
        GameRuleMetadata metadata = GameRuleMetadata.of(gameType);
        return new GameSettings(
                QuestionLevel.N5,
                QuestionSource.GLOBAL_VOCABULARY,
                metadata.defaultAnswerMode(),
                10,
                15,
                Map.of());
    }

    /** Merge kiểu patch: field null giữ nguyên giá trị cũ. */
    public GameSettings merge(GameSettings patch) {
        if (patch == null) {
            return this;
        }
        Map<String, Object> mergedExtra = new LinkedHashMap<>(this.extra);
        mergedExtra.putAll(patch.extra());
        return new GameSettings(
                patch.questionLevel() != null ? patch.questionLevel() : this.questionLevel,
                patch.questionSource() != null ? patch.questionSource() : this.questionSource,
                patch.answerMode() != null ? patch.answerMode() : this.answerMode,
                patch.questionCount() != null ? patch.questionCount() : this.questionCount,
                patch.secondsPerQuestion() != null ? patch.secondsPerQuestion() : this.secondsPerQuestion,
                mergedExtra);
    }
}
