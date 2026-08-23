package admin.jlas.game.common.security;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/** Truy xuất user hiện tại từ SecurityContext. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static Optional<UserPrincipal> current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }
        return auth.getPrincipal() instanceof UserPrincipal principal ? Optional.of(principal) : Optional.empty();
    }

    public static Optional<Long> currentUserId() {
        return current().map(UserPrincipal::getUserId);
    }

    public static Long requireUserId() {
        return currentUserId()
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập"));
    }
}
