package admin.jlas.game.modules.airdefense.domain;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.QuestionLevel;

import java.util.Map;

/** Cấu hình authoritative được resolve/validate một lần khi tạo session. */
public record AirDefenseConfig(
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

    public static AirDefenseConfig from(GameSettings settings, AirDefensePlayMode playMode) {
        Map<String, Object> extra = settings.extra();
        AirDefenseObjective fallback = playMode == AirDefensePlayMode.SOLO
                ? AirDefenseObjective.PRACTICE
                : AirDefenseObjective.SCORE_RACE;
        AirDefenseObjective objective = enumOr(extra, "objective", AirDefenseObjective.class, fallback);
        if (playMode == AirDefensePlayMode.MULTIPLAYER
                && objective != AirDefenseObjective.SCORE_RACE
                && objective != AirDefenseObjective.SURVIVAL) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Phòng Air Defense chỉ hỗ trợ SCORE_RACE hoặc SURVIVAL");
        }
        if (playMode == AirDefensePlayMode.SOLO && objective == AirDefenseObjective.SCORE_RACE) {
            objective = AirDefenseObjective.SCORE_CHALLENGE;
        }

        AirDefenseDifficulty difficulty = enumOr(
                extra, "difficulty", AirDefenseDifficulty.class, AirDefenseDifficulty.NORMAL);
        AnswerMode answerMode = settings.answerMode() == null
                ? AnswerMode.KANJI_TO_HIRAGANA : settings.answerMode();
        if (answerMode != AnswerMode.KANJI_TO_HIRAGANA
                && answerMode != AnswerMode.KANJI_TO_MEANING) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Air Defense chỉ hỗ trợ Kanji → Hiragana hoặc Kanji → Nghĩa");
        }

        int maxHp = intOr(extra, "maxHp", 3);
        int target = intOr(extra, "targetScore", 10);
        int questions = settings.questionCount() == null ? 10 : settings.questionCount();
        int duration = intOr(extra, "durationSeconds", 120);
        requireRange(maxHp, 1, 10, "Số HP");
        requireRange(target, 5, 50, "Mục tiêu điểm");
        requireRange(questions, 5, 60, "Số câu hỏi");
        requireRange(duration, 30, 600, "Thời lượng");

        int configuredTravel = (settings.secondsPerQuestion() == null
                ? difficulty.travelTimeMs()
                : settings.secondsPerQuestion() * 1_000);
        int travel = Math.max(5_000, Math.min(60_000, configuredTravel));
        int spawn = intOr(extra, "spawnIntervalMs", difficulty.spawnIntervalMs());
        requireRange(spawn, 1_500, 15_000, "Nhịp xuất hiện máy bay");

        return new AirDefenseConfig(objective, difficulty, answerMode,
                settings.questionLevel() == null ? QuestionLevel.N5 : settings.questionLevel(),
                maxHp, target, questions, duration, travel, spawn);
    }

    private static int intOr(Map<String, Object> extra, String key, int fallback) {
        Object value = extra.get(key);
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Giá trị " + key + " không hợp lệ");
        }
    }

    private static <E extends Enum<E>> E enumOr(Map<String, Object> extra, String key,
                                                 Class<E> type, E fallback) {
        Object value = extra.get(key);
        if (value == null) {
            return fallback;
        }
        try {
            return Enum.valueOf(type, value.toString().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Giá trị " + key + " không hợp lệ");
        }
    }

    private static void requireRange(int value, int min, int max, String label) {
        if (value < min || value > max) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    label + " phải nằm trong khoảng " + min + "–" + max);
        }
    }
}
