package admin.jlas.game.config;

import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.Role;
import admin.jlas.game.modules.auth.model.User;
import admin.jlas.game.modules.auth.repository.RoleRepository;
import admin.jlas.game.modules.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seed tài khoản demo để test 2 tab browser (p1.md §18) + 1 tài khoản ADMIN.
 * Tắt bằng {@code game.demo.seed-enabled=false}; mật khẩu lấy từ env, không hardcode.
 * Chạy sau {@link DataInitializer} (Order 2) vì cần bảng roles đã có dữ liệu.
 */
@Configuration
public class DemoDataConfig {

    private static final Logger log = LoggerFactory.getLogger(DemoDataConfig.class);

    @Bean
    @Order(2)
    public ApplicationRunner demoUserSeeder(GameProperties gameProperties,
                                           UserRepository userRepository,
                                           RoleRepository roleRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            GameProperties.Demo demo = gameProperties.getDemo();
            if (!demo.isSeedEnabled()) {
                return;
            }
            seed(userRepository, roleRepository, passwordEncoder, demo.getPassword(),
                    "demo1@jlas.local", "Sakura Demo", RoleName.USER);
            seed(userRepository, roleRepository, passwordEncoder, demo.getPassword(),
                    "demo2@jlas.local", "Kaito Demo", RoleName.USER);
            seed(userRepository, roleRepository, passwordEncoder, demo.getAdminPassword(),
                    demo.getAdminEmail(), "Arena Admin", RoleName.ADMIN);
        };
    }

    private void seed(UserRepository userRepository, RoleRepository roleRepository,
                      PasswordEncoder encoder, String rawPassword,
                      String email, String fullName, RoleName roleName) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            // User đã tồn tại (DB cũ, trước khi có bảng roles): backfill role_id,
            // không bao giờ ghi đè mật khẩu của tài khoản đang dùng.
            userRepository.findByEmailWithRole(email).ifPresent(existing -> {
                if (existing.getRole() == null || existing.getRole().getName() != roleName) {
                    roleRepository.findByName(roleName).ifPresent(role -> {
                        existing.setRole(role);
                        userRepository.save(existing);
                        log.info("Backfilled role of {} -> {}", email, roleName);
                    });
                }
            });
            return;
        }
        Role role = roleRepository.findByName(roleName).orElse(null);
        if (role == null) {
            log.warn("Skip seeding {}: role {} chưa có trong DB", email, roleName);
            return;
        }
        userRepository.save(User.builder()
                .email(email)
                .passwordHash(encoder.encode(rawPassword))
                .fullName(fullName)
                .role(role)
                .isBan(false)
                .build());
        log.info("Seeded user {} với role {}", email, roleName);
    }
}
