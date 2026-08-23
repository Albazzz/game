package admin.jlas.game.modules.airdefense.repository;

import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AirDefenseResultRepository extends JpaRepository<AirDefenseResult, Long> {

    List<AirDefenseResult> findByUser_UserIdOrderByFinishedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r FROM AirDefenseResult r WHERE r.playMode = 'SOLO' ORDER BY r.score DESC")
    List<AirDefenseResult> findTopEndlessScores(Pageable pageable);

    @Query("SELECT r FROM AirDefenseResult r WHERE r.ranked = true AND r.winner = true ORDER BY r.score DESC")
    List<AirDefenseResult> findTopRankedWinners(Pageable pageable);

    @Query("SELECT MAX(r.score) FROM AirDefenseResult r WHERE r.user.userId = :userId")
    Integer findPersonalBestScore(@Param("userId") Long userId);
}
