package admin.jlas.game.modules.memory.repository;

import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.memory.model.GameVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GameVocabularyRepository extends JpaRepository<GameVocabulary, Long> {

    /**
     * Lấy ngẫu nhiên n từ theo level. RAND() chấp nhận được vì bảng nhỏ và chỉ
     * gọi một lần mỗi lần sinh bàn, không phải mỗi lượt.
     */
    @Query(value = """
            SELECT * FROM game_vocabulary
            WHERE jlpt_level = :level
            ORDER BY RAND()
            LIMIT :limit
            """, nativeQuery = true)
    List<GameVocabulary> randomByLevel(@Param("level") String level, @Param("limit") int limit);

    @Query(value = """
            SELECT * FROM game_vocabulary
            ORDER BY RAND()
            LIMIT :limit
            """, nativeQuery = true)
    List<GameVocabulary> randomAny(@Param("limit") int limit);

    long countByJlptLevel(QuestionLevel level);
}
