package admin.jlas.game.modules.auth.repository;

import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);
}
