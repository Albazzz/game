package admin.jlas.game.modules.auth.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.auth.dto.AuthDtos.AuthUserDto;
import admin.jlas.game.modules.auth.dto.AuthDtos.GoogleLoginRequest;
import admin.jlas.game.modules.auth.dto.AuthDtos.LoginRequest;
import admin.jlas.game.modules.auth.dto.AuthDtos.LoginResponse;
import admin.jlas.game.modules.auth.dto.AuthDtos.RegisterRequest;
import admin.jlas.game.modules.auth.enums.LoginType;
import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.Role;
import admin.jlas.game.modules.auth.model.User;
import admin.jlas.game.modules.auth.repository.RoleRepository;
import admin.jlas.game.modules.auth.repository.UserRepository;
import admin.jlas.game.modules.auth.security.JwtService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenService googleTokenService;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        // Người tự đăng ký luôn là USER — không cho client chọn role.
        Role defaultRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR,
                        "Default USER role is not configured"));
        User user = userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role(defaultRole)
                .isBan(false)
                .build());
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailWithRole(request.email().trim())
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_CREDENTIALS));
        // Tài khoản tạo bằng Google chưa có mật khẩu cục bộ -> không cho login form.
        if (!StringUtils.hasText(user.getPasswordHash())
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (Boolean.TRUE.equals(user.getIsBan())) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khoá");
        }
        return issueToken(user);
    }

    /**
     * Đăng nhập bằng Google ID token: tự tạo tài khoản USER lần đầu, lần sau
     * chỉ bổ sung google_id / avatar còn thiếu. Không bao giờ ghi đè mật khẩu.
     */
    @Transactional
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenService.GoogleUserInfo googleUser =
                googleTokenService.verifyIdToken(request.idToken());
        String email = googleUser.email().trim().toLowerCase();

        User user = userRepository.findByEmailWithRole(email).orElse(null);
        if (user == null) {
            Role defaultRole = roleRepository.findByName(RoleName.USER)
                    .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR,
                            "Default USER role is not configured"));
            user = userRepository.save(User.builder()
                    .email(email)
                    .googleId(googleUser.googleId())
                    .fullName(StringUtils.hasText(googleUser.fullName()) ? googleUser.fullName() : email)
                    .avatar(googleUser.avatar())
                    .loginType(LoginType.GOOGLE)
                    .role(defaultRole)
                    .isBan(false)
                    .build());
            log.info("Created Google user {}", email);
        } else {
            if (Boolean.TRUE.equals(user.getIsBan())) {
                throw new ApiException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khoá");
            }
            boolean dirty = false;
            if (!StringUtils.hasText(user.getGoogleId())) {
                user.setGoogleId(googleUser.googleId());
                dirty = true;
            }
            if (!StringUtils.hasText(user.getAvatar()) && StringUtils.hasText(googleUser.avatar())) {
                user.setAvatar(googleUser.avatar());
                dirty = true;
            }
            if (dirty) {
                userRepository.save(user);
            }
        }
        return issueToken(user);
    }

    public AuthUserDto toDto(User user) {
        return new AuthUserDto(user.getUserId(), user.getEmail(), user.getFullName(),
                user.getAvatar(), user.getRoleName().name());
    }

    private LoginResponse issueToken(User user) {
        UserPrincipal principal = UserPrincipal.from(user);
        return new LoginResponse(
                jwtService.generateAccessToken(principal),
                jwtService.getAccessTokenExpirationMs(),
                toDto(user));
    }
}
