package admin.jlas.game.modules.arena.repository;

import admin.jlas.game.modules.arena.model.GameMatchPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameMatchPlayerRepository extends JpaRepository<GameMatchPlayer, Long> {

    List<GameMatchPlayer> findByMatchIdOrderBySlotAsc(Long matchId);
}
