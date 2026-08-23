package admin.jlas.game.common.exception;

import org.springframework.http.HttpStatus;

/** Danh mục lỗi dùng chung — mirror convention của app J-LAS. */
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "Phòng không tồn tại hoặc đã đóng"),
    ROOM_FULL(HttpStatus.CONFLICT, "Phòng đã đủ người"),
    ROOM_CLOSED(HttpStatus.CONFLICT, "Phòng đã đóng"),
    ROOM_NOT_JOINABLE(HttpStatus.CONFLICT, "Phòng đang trong trận, không thể vào"),
    NOT_ROOM_MEMBER(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng này"),
    NOT_ROOM_HOST(HttpStatus.FORBIDDEN, "Chỉ chủ phòng mới thực hiện được"),
    START_REQUIREMENTS_UNMET(HttpStatus.CONFLICT, "Chưa đủ điều kiện bắt đầu"),
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Ván chơi không tồn tại hoặc đã kết thúc"),
    SESSION_FINISHED(HttpStatus.CONFLICT, "Ván chơi đã kết thúc"),
    NOT_SESSION_PLAYER(HttpStatus.FORBIDDEN, "Bạn không tham gia ván này"),
    NOT_YOUR_TURN(HttpStatus.CONFLICT, "Chưa tới lượt của bạn"),
    INVALID_MOVE(HttpStatus.CONFLICT, "Lượt đi không hợp lệ"),
    MEMORY_VOCABULARY_INSUFFICIENT(HttpStatus.CONFLICT, "Chưa đủ từ vựng để tạo bàn chơi"),
    CONFLICT(HttpStatus.CONFLICT, "Conflict"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email đã được đăng ký"),
    GOOGLE_AUTH_FAILED(HttpStatus.UNAUTHORIZED, "Đăng nhập Google thất bại"),
    GOOGLE_LOGIN_DISABLED(HttpStatus.SERVICE_UNAVAILABLE, "Đăng nhập Google chưa được cấu hình"),
    PAYLOAD_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "Payload quá lớn"),
    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "Too many requests"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
