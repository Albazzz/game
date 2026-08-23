package admin.jlas.game.modules.airdefense.repository;

import admin.jlas.game.modules.airdefense.model.UserSpaceship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSpaceshipRepository extends JpaRepository<UserSpaceship, Long> {

    List<UserSpaceship> findByUser_UserId(Long userId);

    Optional<UserSpaceship> findByUser_UserIdAndSpaceship_ShipId(Long userId, String shipId);

    @Query("SELECT us.spaceship.shipId FROM UserSpaceship us WHERE us.user.userId = :userId")
    List<String> findOwnedShipIds(@Param("userId") Long userId);
}
