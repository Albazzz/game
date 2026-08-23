package admin.jlas.game.modules.auth.enums;

/**
 * Vai trò người dùng — copy nguyên thứ tự từ app J-LAS để merge không lệch dữ liệu.
 * Thứ tự ưu tiên tăng dần theo thứ tự enum (BR-10 / BR-12).
 */
public enum RoleName {
    USER,
    PREMIUM,
    MODERATOR,
    ADMIN,
    SUPER_ADMIN;

    /** Quyền quản trị Arena: ADMIN trở lên. */
    public boolean isAdministrative() {
        return this == ADMIN || this == SUPER_ADMIN;
    }
}
