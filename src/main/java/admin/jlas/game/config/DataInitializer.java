package admin.jlas.game.config;

import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.Role;
import admin.jlas.game.modules.auth.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * Seed bảng {@code roles} — copy nguyên hành vi DataInitializer của app J-LAS.
 * Chạy trước mọi seeder user (Order 1) vì users.role_id tham chiếu bảng này.
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    public ApplicationRunner roleSeeder(RoleRepository roleRepository) {
        return args -> {
            createRoleIfMissing(roleRepository, RoleName.USER, "Default learner role");
            createRoleIfMissing(roleRepository, RoleName.PREMIUM, "Premium subscriber role");
            createRoleIfMissing(roleRepository, RoleName.MODERATOR, "Content moderator role");
            createRoleIfMissing(roleRepository, RoleName.ADMIN, "Administrator role");
            createRoleIfMissing(roleRepository, RoleName.SUPER_ADMIN, "Super administrator role");
        };
    }

    private void createRoleIfMissing(RoleRepository repository, RoleName name, String description) {
        try {
            if (!repository.existsByName(name)) {
                repository.save(Role.builder().name(name).description(description).build());
                log.info("Seeded role {}", name);
            }
        } catch (Exception ex) {
            // Không chặn boot: role có thể đã được seed bởi instance khác.
            log.warn("Failed seeding role {}: {}", name, ex.getMessage());
        }
    }
}
