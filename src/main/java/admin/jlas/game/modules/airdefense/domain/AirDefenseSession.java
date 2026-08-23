package admin.jlas.game.modules.airdefense.domain;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.QuestionLevel;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class AirDefenseSession {

    private String sessionId;
    private String roomId;
    private Long matchId;

    private String playMode; // "SOLO" or "PVP"
    private boolean ranked;
    private QuestionLevel jlptLevel;
    private AnswerMode answerMode;

    private int wave = 1;
    private int totalWavesCompleted = 0;
    private AirDefenseSessionStatus status = AirDefenseSessionStatus.PLAYING;

    private Map<Long, AirDefensePlayerState> players = new ConcurrentHashMap<>();
    private List<AirDefenseTarget> targets = new CopyOnWriteArrayList<>();
    private List<AugmentType> currentDraftAugments = new CopyOnWriteArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long winnerUserId;

    public AirDefenseSession() {}

    public static AirDefenseSessionBuilder builder() {
        return new AirDefenseSessionBuilder();
    }

    public static class AirDefenseSessionBuilder {
        private String sessionId;
        private String roomId;
        private Long matchId;
        private String playMode;
        private boolean ranked;
        private QuestionLevel jlptLevel;
        private AnswerMode answerMode;
        private int wave = 1;
        private int totalWavesCompleted = 0;
        private AirDefenseSessionStatus status = AirDefenseSessionStatus.PLAYING;
        private Map<Long, AirDefensePlayerState> players = new ConcurrentHashMap<>();
        private List<AirDefenseTarget> targets = new CopyOnWriteArrayList<>();
        private List<AugmentType> currentDraftAugments = new CopyOnWriteArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Long winnerUserId;

        public AirDefenseSessionBuilder sessionId(String sessionId) { this.sessionId = sessionId; return this; }
        public AirDefenseSessionBuilder roomId(String roomId) { this.roomId = roomId; return this; }
        public AirDefenseSessionBuilder matchId(Long matchId) { this.matchId = matchId; return this; }
        public AirDefenseSessionBuilder playMode(String playMode) { this.playMode = playMode; return this; }
        public AirDefenseSessionBuilder ranked(boolean ranked) { this.ranked = ranked; return this; }
        public AirDefenseSessionBuilder jlptLevel(QuestionLevel jlptLevel) { this.jlptLevel = jlptLevel; return this; }
        public AirDefenseSessionBuilder answerMode(AnswerMode answerMode) { this.answerMode = answerMode; return this; }
        public AirDefenseSessionBuilder wave(int wave) { this.wave = wave; return this; }
        public AirDefenseSessionBuilder totalWavesCompleted(int totalWavesCompleted) { this.totalWavesCompleted = totalWavesCompleted; return this; }
        public AirDefenseSessionBuilder status(AirDefenseSessionStatus status) { this.status = status; return this; }
        public AirDefenseSessionBuilder players(Map<Long, AirDefensePlayerState> players) { this.players = players; return this; }
        public AirDefenseSessionBuilder targets(List<AirDefenseTarget> targets) { this.targets = targets; return this; }
        public AirDefenseSessionBuilder currentDraftAugments(List<AugmentType> currentDraftAugments) { this.currentDraftAugments = currentDraftAugments; return this; }
        public AirDefenseSessionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AirDefenseSessionBuilder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public AirDefenseSessionBuilder finishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; return this; }
        public AirDefenseSessionBuilder winnerUserId(Long winnerUserId) { this.winnerUserId = winnerUserId; return this; }

        public AirDefenseSession build() {
            AirDefenseSession s = new AirDefenseSession();
            s.sessionId = this.sessionId;
            s.roomId = this.roomId;
            s.matchId = this.matchId;
            s.playMode = this.playMode;
            s.ranked = this.ranked;
            s.jlptLevel = this.jlptLevel;
            s.answerMode = this.answerMode;
            s.wave = this.wave;
            s.totalWavesCompleted = this.totalWavesCompleted;
            s.status = this.status;
            if (this.players != null) s.players = this.players;
            if (this.targets != null) s.targets = this.targets;
            if (this.currentDraftAugments != null) s.currentDraftAugments = this.currentDraftAugments;
            s.createdAt = this.createdAt;
            s.startedAt = this.startedAt;
            s.finishedAt = this.finishedAt;
            s.winnerUserId = this.winnerUserId;
            return s;
        }
    }

    public AirDefensePlayerState getPlayer(Long userId) {
        return players.get(userId);
    }

    public List<AirDefensePlayerState> getPlayerList() {
        return new ArrayList<>(players.values());
    }

    public void addTarget(AirDefenseTarget target) {
        targets.add(target);
    }

    public void removeDeadTargets() {
        targets.removeIf(AirDefenseTarget::isDead);
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public String getPlayMode() { return playMode; }
    public void setPlayMode(String playMode) { this.playMode = playMode; }

    public boolean isRanked() { return ranked; }
    public void setRanked(boolean ranked) { this.ranked = ranked; }

    public QuestionLevel getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(QuestionLevel jlptLevel) { this.jlptLevel = jlptLevel; }

    public AnswerMode getAnswerMode() { return answerMode; }
    public void setAnswerMode(AnswerMode answerMode) { this.answerMode = answerMode; }

    public int getWave() { return wave; }
    public void setWave(int wave) { this.wave = wave; }

    public int getTotalWavesCompleted() { return totalWavesCompleted; }
    public void setTotalWavesCompleted(int totalWavesCompleted) { this.totalWavesCompleted = totalWavesCompleted; }

    public AirDefenseSessionStatus getStatus() { return status; }
    public void setStatus(AirDefenseSessionStatus status) { this.status = status; }

    public Map<Long, AirDefensePlayerState> getPlayers() { return players; }
    public void setPlayers(Map<Long, AirDefensePlayerState> players) { this.players = players; }

    public List<AirDefenseTarget> getTargets() { return targets; }
    public void setTargets(List<AirDefenseTarget> targets) { this.targets = targets; }

    public List<AugmentType> getCurrentDraftAugments() { return currentDraftAugments; }
    public void setCurrentDraftAugments(List<AugmentType> currentDraftAugments) { this.currentDraftAugments = currentDraftAugments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }

    public Long getWinnerUserId() { return winnerUserId; }
    public void setWinnerUserId(Long winnerUserId) { this.winnerUserId = winnerUserId; }
}
