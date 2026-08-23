package admin.jlas.game.modules.auth.model;

import admin.jlas.game.modules.auth.enums.LoginType;
import admin.jlas.game.modules.auth.enums.RoleName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * User tối giản cho Game Arena. Khi merge vào app J-LAS, module game sẽ dùng
 * bảng {@code users} có sẵn — không tạo hệ thống user trùng lặp.
 */
@Entity
@Table(name = "users", indexes = @Index(name = "idx_users_email", columnList = "email", unique = true))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    /**
     * EAGER vì mọi lần load user đều cần role để build authorities
     * (UserDetailsService chạy ngoài transaction của request).
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /** Null khi tài khoản chỉ đăng nhập bằng Google (không có mật khẩu cục bộ). */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    /** Nguồn tạo tài khoản: LOCAL (email + mật khẩu) hoặc GOOGLE. */
    @Enumerated(EnumType.STRING)
    @Column(name = "login_type", nullable = false, length = 16)
    @Builder.Default
    private LoginType loginType = LoginType.LOCAL;

    /** {@code sub} của Google ID token — dùng để nhận diện tài khoản Google. */
    @Column(name = "google_id", length = 255)
    private String googleId;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "avatar", length = 500)
    private String avatar;

    @Column(name = "is_ban", nullable = false)
    @Builder.Default
    private Boolean isBan = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Role đã chuẩn hoá: user chưa gán role coi như USER. */
    public RoleName getRoleName() {
        return role != null && role.getName() != null ? role.getName() : RoleName.USER;
    }
}
