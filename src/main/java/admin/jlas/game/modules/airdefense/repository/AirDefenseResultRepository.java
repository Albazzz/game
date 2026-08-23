package admin.jlas.game.modules.airdefense.repository;

import admin.jlas.game.modules.airdefense.domain.AirDefenseObjective;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AirDefenseResultRepository extends JpaRepository<AirDefenseResult, Long> {
    boolean existsBySessionIdAndUserId(String sessionId, Long userId);

    List<AirDefenseResult> findByUserIdAndPlayModeAndObjective(
            Long userId, AirDefensePlayMode playMode, AirDefenseObjective objective);
}
