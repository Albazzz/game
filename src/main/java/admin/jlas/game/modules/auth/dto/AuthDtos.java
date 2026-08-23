package admin.jlas.game.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO auth — chỉ đủ cho demo Arena (login/register/me). */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 6, max = 100) String password) {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank @Size(max = 80) String fullName) {
    }

    /** ID token do Google Identity Services trả về ở client. */
    public record GoogleLoginRequest(@NotBlank String idToken) {
    }

    public record AuthUserDto(Long userId, String email, String fullName, String avatar, String role) {
    }

    public record LoginResponse(String accessToken, long expiresInMs, AuthUserDto user) {
    }
}
