package admin.jlas.game.modules.airdefense.model;

import admin.jlas.game.modules.airdefense.domain.AirDefenseDifficulty;
import admin.jlas.game.modules.airdefense.domain.AirDefenseObjective;
import admin.jlas.game.modules.airdefense.domain.AirDefenseOutcome;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
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

@Entity
@Table(name = "air_defense_result", indexes = {
        @Index(name = "idx_air_result_user", columnList = "user_id"),
        @Index(name = "idx_air_result_session", columnList = "session_id"),
        @Index(name = "idx_air_result_finished", columnList = "finished_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirDefenseResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;
    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;
    @Column(name = "match_id")
    private Long matchId;
    @Column(name = "room_id", length = 64)
    private String roomId;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Enumerated(EnumType.STRING)
    @Column(name = "play_mode", nullable = false, length = 16)
    private AirDefensePlayMode playMode;
    @Enumerated(EnumType.STRING)
    @Column(name = "objective", nullable = false, length = 24)
    private AirDefenseObjective objective;
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 16)
    private AirDefenseDifficulty difficulty;
    @Enumerated(EnumType.STRING)
    @Column(name = "answer_mode", nullable = false, length = 32)
    private AnswerMode answerMode;
    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 10)
    private QuestionLevel level;
    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", nullable = false, length = 24)
    private AirDefenseOutcome outcome;
    @Column(name = "hp_remaining", nullable = false)
    private int hpRemaining;
    @Column(name = "score", nullable = false)
    private int score;
    @Column(name = "questions_answered", nullable = false)
    private int questionsAnswered;
    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers;
    @Column(name = "incorrect_answers", nullable = false)
    private int incorrectAnswers;
    @Column(name = "accuracy_percent", nullable = false)
    private int accuracyPercent;
    @Column(name = "best_combo", nullable = false)
    private int bestCombo;
    @Column(name = "average_response_ms")
    private Integer averageResponseMs;
    @Column(name = "duration_ms", nullable = false)
    private long durationMs;
    @Column(name = "ranked", nullable = false)
    private boolean ranked;
    @Column(name = "winner", nullable = false)
    private boolean winner;
    @Column(name = "finished_at", nullable = false)
    private Instant finishedAt;
}
