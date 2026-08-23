package admin.jlas.game.modules.auth.enums;

/**
 * Nguồn tạo tài khoản — copy từ app J-LAS để khi merge không lệch dữ liệu.
 * LOCAL: đăng ký bằng email + mật khẩu. GOOGLE: tạo qua Google Sign-In.
 */
public enum LoginType {
    LOCAL,
    GOOGLE
}
