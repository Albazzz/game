package admin.jlas.game.modules.airdefense.model;

import admin.jlas.game.modules.arena.model.GameMatch;
import admin.jlas.game.modules.auth.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(name = "air_defense_result", indexes = {
        @Index(name = "idx_air_result_user", columnList = "user_id"),
        @Index(name = "idx_air_result_session", columnList = "session_id"),
        @Index(name = "idx_air_result_finished", columnList = "finished_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_air_result_session_user", columnNames = {"session_id", "user_id"})
})
public class AirDefenseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private GameMatch match;

    @Column(name = "room_id", length = 64)
    private String roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "play_mode", nullable = false, length = 16)
    private String playMode;

    @Column(name = "objective", nullable = false, length = 24)
    private String objective;

    @Column(name = "difficulty", nullable = false, length = 16)
    private String difficulty;

    @Column(name = "answer_mode", nullable = false, length = 32)
    private String answerMode;

    @Column(name = "jlpt_level", nullable = false, length = 10)
    private String jlptLevel;

    @Column(name = "outcome", nullable = false, length = 24)
    private String outcome;

    @Column(name = "hp_remaining", nullable = false)
    private Integer hpRemaining;

    @Column(name = "score", nullable = false)
    private Integer score = 0;

    @Column(name = "questions_answered", nullable = false)
    private Integer questionsAnswered = 0;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers = 0;

    @Column(name = "incorrect_answers", nullable = false)
    private Integer incorrectAnswers = 0;

    @Column(name = "accuracy_percent", nullable = false)
    private Integer accuracyPercent = 0;

    @Column(name = "best_combo", nullable = false)
    private Integer bestCombo = 0;

    @Column(name = "average_response_ms")
    private Integer averageResponseMs;

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs = 0L;

    @Column(name = "ranked", nullable = false)
    private Boolean ranked = false;

    @Column(name = "winner", nullable = false)
    private Boolean winner = false;

    @Column(name = "finished_at", nullable = false)
    private LocalDateTime finishedAt;

    public AirDefenseResult() {}

    public static AirDefenseResultBuilder builder() {
        return new AirDefenseResultBuilder();
    }

    public static class AirDefenseResultBuilder {
        private Long resultId;
        private String sessionId;
        private GameMatch match;
        private String roomId;
        private User user;
        private String playMode;
        private String objective;
        private String difficulty;
        private String answerMode;
        private String jlptLevel;
        private String outcome;
        private Integer hpRemaining;
        private Integer score = 0;
        private Integer questionsAnswered = 0;
        private Integer correctAnswers = 0;
        private Integer incorrectAnswers = 0;
        private Integer accuracyPercent = 0;
        private Integer bestCombo = 0;
        private Integer averageResponseMs;
        private Long durationMs = 0L;
        private Boolean ranked = false;
        private Boolean winner = false;
        private LocalDateTime finishedAt;

        public AirDefenseResultBuilder resultId(Long resultId) { this.resultId = resultId; return this; }
        public AirDefenseResultBuilder sessionId(String sessionId) { this.sessionId = sessionId; return this; }
        public AirDefenseResultBuilder match(GameMatch match) { this.match = match; return this; }
        public AirDefenseResultBuilder roomId(String roomId) { this.roomId = roomId; return this; }
        public AirDefenseResultBuilder user(User user) { this.user = user; return this; }
        public AirDefenseResultBuilder playMode(String playMode) { this.playMode = playMode; return this; }
        public AirDefenseResultBuilder objective(String objective) { this.objective = objective; return this; }
        public AirDefenseResultBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public AirDefenseResultBuilder answerMode(String answerMode) { this.answerMode = answerMode; return this; }
        public AirDefenseResultBuilder jlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; return this; }
        public AirDefenseResultBuilder outcome(String outcome) { this.outcome = outcome; return this; }
        public AirDefenseResultBuilder hpRemaining(Integer hpRemaining) { this.hpRemaining = hpRemaining; return this; }
        public AirDefenseResultBuilder score(Integer score) { this.score = score; return this; }
        public AirDefenseResultBuilder questionsAnswered(Integer questionsAnswered) { this.questionsAnswered = questionsAnswered; return this; }
        public AirDefenseResultBuilder correctAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; return this; }
        public AirDefenseResultBuilder incorrectAnswers(Integer incorrectAnswers) { this.incorrectAnswers = incorrectAnswers; return this; }
        public AirDefenseResultBuilder accuracyPercent(Integer accuracyPercent) { this.accuracyPercent = accuracyPercent; return this; }
        public AirDefenseResultBuilder bestCombo(Integer bestCombo) { this.bestCombo = bestCombo; return this; }
        public AirDefenseResultBuilder averageResponseMs(Integer averageResponseMs) { this.averageResponseMs = averageResponseMs; return this; }
        public AirDefenseResultBuilder durationMs(Long durationMs) { this.durationMs = durationMs; return this; }
        public AirDefenseResultBuilder ranked(Boolean ranked) { this.ranked = ranked; return this; }
        public AirDefenseResultBuilder winner(Boolean winner) { this.winner = winner; return this; }
        public AirDefenseResultBuilder finishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; return this; }

        public AirDefenseResult build() {
            AirDefenseResult r = new AirDefenseResult();
            r.resultId = this.resultId;
            r.sessionId = this.sessionId;
            r.match = this.match;
            r.roomId = this.roomId;
            r.user = this.user;
            r.playMode = this.playMode;
            r.objective = this.objective;
            r.difficulty = this.difficulty;
            r.answerMode = this.answerMode;
            r.jlptLevel = this.jlptLevel;
            r.outcome = this.outcome;
            r.hpRemaining = this.hpRemaining;
            r.score = this.score != null ? this.score : 0;
            r.questionsAnswered = this.questionsAnswered != null ? this.questionsAnswered : 0;
            r.correctAnswers = this.correctAnswers != null ? this.correctAnswers : 0;
            r.incorrectAnswers = this.incorrectAnswers != null ? this.incorrectAnswers : 0;
            r.accuracyPercent = this.accuracyPercent != null ? this.accuracyPercent : 0;
            r.bestCombo = this.bestCombo != null ? this.bestCombo : 0;
            r.averageResponseMs = this.averageResponseMs;
            r.durationMs = this.durationMs != null ? this.durationMs : 0L;
            r.ranked = this.ranked != null ? this.ranked : false;
            r.winner = this.winner != null ? this.winner : false;
            r.finishedAt = this.finishedAt;
            return r;
        }
    }

    public Long getResultId() { return resultId; }
    public void setResultId(Long resultId) { this.resultId = resultId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public GameMatch getMatch() { return match; }
    public void setMatch(GameMatch match) { this.match = match; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPlayMode() { return playMode; }
    public void setPlayMode(String playMode) { this.playMode = playMode; }

    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getAnswerMode() { return answerMode; }
    public void setAnswerMode(String answerMode) { this.answerMode = answerMode; }

    public String getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public Integer getHpRemaining() { return hpRemaining; }
    public void setHpRemaining(Integer hpRemaining) { this.hpRemaining = hpRemaining; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getQuestionsAnswered() { return questionsAnswered; }
    public void setQuestionsAnswered(Integer questionsAnswered) { this.questionsAnswered = questionsAnswered; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Integer getIncorrectAnswers() { return incorrectAnswers; }
    public void setIncorrectAnswers(Integer incorrectAnswers) { this.incorrectAnswers = incorrectAnswers; }

    public Integer getAccuracyPercent() { return accuracyPercent; }
    public void setAccuracyPercent(Integer accuracyPercent) { this.accuracyPercent = accuracyPercent; }

    public Integer getBestCombo() { return bestCombo; }
    public void setBestCombo(Integer bestCombo) { this.bestCombo = bestCombo; }

    public Integer getAverageResponseMs() { return averageResponseMs; }
    public void setAverageResponseMs(Integer averageResponseMs) { this.averageResponseMs = averageResponseMs; }

    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }

    public Boolean getRanked() { return ranked; }
    public void setRanked(Boolean ranked) { this.ranked = ranked; }

    public Boolean getWinner() { return winner; }
    public void setWinner(Boolean winner) { this.winner = winner; }

    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
}
