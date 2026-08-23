package admin.jlas.game.modules.airdefense.repository;

import admin.jlas.game.modules.airdefense.model.AirDefenseSpaceship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AirDefenseSpaceshipRepository extends JpaRepository<AirDefenseSpaceship, String> {
}
