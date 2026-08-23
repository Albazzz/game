package admin.jlas.game.modules.arena.repository;

import admin.jlas.game.modules.arena.model.GameMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameMatchRepository extends JpaRepository<GameMatch, Long> {

    Optional<GameMatch> findFirstByRoomIdOrderByStartedAtDesc(String roomId);
}
