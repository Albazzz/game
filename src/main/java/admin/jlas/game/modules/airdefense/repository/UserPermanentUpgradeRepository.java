package admin.jlas.game.modules.airdefense.repository;

import admin.jlas.game.modules.airdefense.model.UserPermanentUpgrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPermanentUpgradeRepository extends JpaRepository<UserPermanentUpgrade, Long> {
}
