package admin.jlas.game.modules.arena.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Validate settings phía server (enum whitelist + range + answerMode phải được game
 * hỗ trợ) rồi merge kiểu patch. Tách riêng để luồng phòng ({@link RoomService}) và
 * luồng solo của từng minigame dùng đúng một bộ luật (rule.md §11).
 */
@Component
public class GameSettingsValidator {

    private static final int MAX_EXTRA_ENTRIES = 20;

    public GameSettings validateAndMerge(GameRuleMetadata metadata, GameSettings current,
                                         UpdateSettingsRequest request) {
        if (request == null) {
            return current;
        }
        if (request.answerMode() != null && !metadata.supports(request.answerMode())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED,
                    "Chế độ trả lời không được hỗ trợ cho " + metadata.displayName());
        }
        if (request.questionCount() != null
                && (request.questionCount() < GameSettings.MIN_QUESTION_COUNT
                || request.questionCount() > GameSettings.MAX_QUESTION_COUNT)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Số câu hỏi không hợp lệ");
        }
        if (request.secondsPerQuestion() != null
                && (request.secondsPerQuestion() < GameSettings.MIN_SECONDS_PER_QUESTION
                || request.secondsPerQuestion() > GameSettings.MAX_SECONDS_PER_QUESTION)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Thời gian mỗi câu không hợp lệ");
        }
        Map<String, Object> extra = request.extra();
        if (extra != null && extra.size() > MAX_EXTRA_ENTRIES) {
            throw new ApiException(ErrorCode.PAYLOAD_TOO_LARGE, "Cấu hình mở rộng quá lớn");
        }
        GameSettings patch = new GameSettings(
                request.questionLevel(),
                request.questionSource(),
                request.answerMode(),
                request.questionCount(),
                request.secondsPerQuestion(),
                extra);
        return current.merge(patch);
    }
}
