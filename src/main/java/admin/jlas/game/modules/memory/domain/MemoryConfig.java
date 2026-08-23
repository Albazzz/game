package admin.jlas.game.modules.memory.domain;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.QuestionLevel;

import java.util.List;
import java.util.Map;

/**
 * Cấu hình một ván Memory Match, suy ra từ {@link GameSettings} (phần chung) và
 * {@code settings.extra} (phần riêng của game). Validate ở đây để cả REST solo
 * và luồng phòng multiplayer dùng chung một bộ luật (rule.md §11).
 */
public record MemoryConfig(
        int boardSize,
        MemoryObjective objective,
        AnswerMode pairMode,
        QuestionLevel level,
        int turnSeconds,
        Integer totalSeconds,
        Integer moveLimit,
        boolean keepTurnOnMatch) {

    public static final List<Integer> ALLOWED_BOARD_SIZES = List.of(12, 20, 30, 40);
    public static final List<Integer> ALLOWED_TURN_SECONDS = List.of(10, 15, 20);
    public static final List<Integer> ALLOWED_TOTAL_SECONDS = List.of(180, 300, 600);
    public static final int MIN_MOVE_LIMIT = 10;
    public static final int MAX_MOVE_LIMIT = 200;

    private static final List<AnswerMode> ALLOWED_PAIR_MODES = List.of(
            AnswerMode.KANJI_TO_HIRAGANA,
            AnswerMode.KANJI_TO_MEANING,
            AnswerMode.HIRAGANA_TO_MEANING);

    public int pairCount() {
        return boardSize / 2;
    }

    /** Mặt của thẻ "câu hỏi" theo pair mode. */
    public MemoryCardFace primaryFace() {
        return switch (pairMode) {
            case HIRAGANA_TO_MEANING -> MemoryCardFace.READING;
            default -> MemoryCardFace.TERM;
        };
    }

    /** Mặt của thẻ "đáp án" theo pair mode. */
    public MemoryCardFace secondaryFace() {
        return switch (pairMode) {
            case KANJI_TO_HIRAGANA -> MemoryCardFace.READING;
            default -> MemoryCardFace.MEANING;
        };
    }

    public static MemoryConfig from(GameSettings settings, MemoryPlayMode playMode) {
        Map<String, Object> extra = settings.extra();

        int boardSize = intOr(extra, "boardSize", 20);
        if (!ALLOWED_BOARD_SIZES.contains(boardSize)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Số thẻ chỉ được là " + ALLOWED_BOARD_SIZES);
        }

        MemoryObjective objective = enumOr(extra, "objective", MemoryObjective.class,
                MemoryObjective.CLASSIC);
        if (objective == MemoryObjective.MOVE_LIMIT && playMode != MemoryPlayMode.SOLO) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Giới hạn số lượt chỉ dùng cho chế độ Solo");
        }

        AnswerMode pairMode = settings.answerMode() == null
                ? AnswerMode.KANJI_TO_HIRAGANA
                : settings.answerMode();
        if (!ALLOWED_PAIR_MODES.contains(pairMode)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Memory Match không hỗ trợ chế độ ghép này");
        }

        QuestionLevel level = settings.questionLevel() == null
                ? QuestionLevel.N5
                : settings.questionLevel();

        int turnSeconds = intOr(extra, "turnSeconds",
                settings.secondsPerQuestion() != null ? settings.secondsPerQuestion() : 15);
        if (!ALLOWED_TURN_SECONDS.contains(turnSeconds)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Thời gian mỗi lượt chỉ được là " + ALLOWED_TURN_SECONDS + " giây");
        }

        Integer totalSeconds = null;
        if (objective == MemoryObjective.TIME_ATTACK) {
            totalSeconds = intOr(extra, "totalSeconds", 300);
            if (!ALLOWED_TOTAL_SECONDS.contains(totalSeconds)) {
                throw new ApiException(ErrorCode.VALIDATION_FAILED,
                        "Tổng thời gian chỉ được là " + ALLOWED_TOTAL_SECONDS + " giây");
            }
        }

        Integer moveLimit = null;
        if (objective == MemoryObjective.MOVE_LIMIT) {
            moveLimit = intOr(extra, "moveLimit", boardSize);
            if (moveLimit < MIN_MOVE_LIMIT || moveLimit > MAX_MOVE_LIMIT) {
                throw new ApiException(ErrorCode.VALIDATION_FAILED, "Giới hạn lượt không hợp lệ");
            }
        }

        boolean keepTurnOnMatch = boolOr(extra, "keepTurnOnMatch", true);

        return new MemoryConfig(boardSize, objective, pairMode, level, turnSeconds,
                totalSeconds, moveLimit, keepTurnOnMatch);
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
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Giá trị " + key + " không hợp lệ");
        }
    }

    private static boolean boolOr(Map<String, Object> extra, String key, boolean fallback) {
        Object value = extra.get(key);
        if (value == null) {
            return fallback;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(String.valueOf(value).trim());
    }

    private static <E extends Enum<E>> E enumOr(Map<String, Object> extra, String key,
                                                Class<E> type, E fallback) {
        Object value = extra.get(key);
        if (value == null) {
            return fallback;
        }
        if (type.isInstance(value)) {
            return type.cast(value);
        }
        try {
            return Enum.valueOf(type, String.valueOf(value).trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Giá trị " + key + " không hợp lệ");
        }
    }
}
