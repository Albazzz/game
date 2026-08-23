package admin.jlas.game.modules.memory.repository;

import admin.jlas.game.modules.memory.model.MemoryMatchResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemoryMatchResultRepository extends JpaRepository<MemoryMatchResult, Long> {

    List<MemoryMatchResult> findByUserIdOrderByFinishedAtDesc(Long userId, Pageable pageable);

    boolean existsBySessionIdAndUserId(String sessionId, Long userId);
}
