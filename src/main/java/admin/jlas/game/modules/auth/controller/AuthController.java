package admin.jlas.game.modules.auth.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.auth.dto.AuthDtos.AuthUserDto;
import admin.jlas.game.modules.auth.dto.AuthDtos.GoogleLoginRequest;
import admin.jlas.game.modules.auth.dto.AuthDtos.LoginRequest;
import admin.jlas.game.modules.auth.dto.AuthDtos.LoginResponse;
import admin.jlas.game.modules.auth.dto.AuthDtos.RegisterRequest;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request,
                                               HttpServletResponse response) {
        LoginResponse result = authService.register(request);
        writeTokenCookie(response, result);
        return ApiResponse.ok("Đăng ký thành công", result);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletResponse response) {
        LoginResponse result = authService.login(request);
        writeTokenCookie(response, result);
        return ApiResponse.ok("Đăng nhập thành công", result);
    }

    /** Google Sign-In: client gửi ID token, server verify rồi phát JWT như login thường. */
    @PostMapping("/google")
    public ApiResponse<LoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request,
                                                  HttpServletResponse response) {
        LoginResponse result = authService.loginWithGoogle(request);
        writeTokenCookie(response, result);
        return ApiResponse.ok("Đăng nhập Google thành công", result);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        return ApiResponse.ok("Đã đăng xuất");
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }
        return ApiResponse.ok("Thông tin người dùng", new AuthUserDto(
                principal.getUserId(), principal.getEmail(),
                principal.getDisplayName(), principal.getAvatar(),
                principal.getRole().name()));
    }

    /**
     * Cookie HttpOnly để trang Thymeleaf và WS handshake dùng được token.
     * secure(false) vì demo chạy http://localhost — bật lại khi deploy HTTPS.
     */
    private void writeTokenCookie(HttpServletResponse response, LoginResponse result) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", result.accessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofMillis(result.expiresInMs()))
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
