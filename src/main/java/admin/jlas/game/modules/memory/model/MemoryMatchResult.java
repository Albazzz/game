package admin.jlas.game.modules.memory.model;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.memory.domain.MemoryObjective;
import admin.jlas.game.modules.memory.domain.MemoryOutcome;
import admin.jlas.game.modules.memory.domain.MemoryPlayMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Kết quả một ván Memory Match của một người chơi. Chỉ ghi khi ván kết thúc —
 * state giữa ván nằm hoàn toàn in-memory (rule.md: không ghi DB mỗi lượt).
 */
@Entity
@Table(name = "memory_match_result", indexes = {
        @Index(name = "idx_memory_result_user", columnList = "user_id"),
        @Index(name = "idx_memory_result_session", columnList = "session_id"),
        @Index(name = "idx_memory_result_finished", columnList = "finished_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryMatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    /** Null với solo (solo không đi qua phòng/match). */
    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "room_id", length = 64)
    private String roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "play_mode", nullable = false, length = 16)
    private MemoryPlayMode playMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "objective", nullable = false, length = 16)
    private MemoryObjective objective;

    @Enumerated(EnumType.STRING)
    @Column(name = "pair_mode", nullable = false, length = 32)
    private AnswerMode pairMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 10)
    private QuestionLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", nullable = false, length = 20)
    private MemoryOutcome outcome;

    @Column(name = "board_size", nullable = false)
    private int boardSize;

    @Column(name = "pairs_found", nullable = false)
    private int pairsFound;

    @Column(name = "mistakes", nullable = false)
    private int mistakes;

    @Column(name = "moves", nullable = false)
    private int moves;

    @Column(name = "best_streak", nullable = false)
    private int bestStreak;

    @Column(name = "accuracy_percent")
    private Integer accuracyPercent;

    @Column(name = "average_decision_ms")
    private Integer averageDecisionMs;

    @Column(name = "duration_ms", nullable = false)
    private long durationMs;

    /** Ván xếp hạng (multiplayer >= 2 người); solo luôn false. */
    @Column(name = "ranked", nullable = false)
    private boolean ranked;

    @Column(name = "winner", nullable = false)
    private boolean winner;

    @Column(name = "finished_at", nullable = false)
    private Instant finishedAt;
}
