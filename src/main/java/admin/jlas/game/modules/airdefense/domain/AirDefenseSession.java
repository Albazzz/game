package admin.jlas.game.modules.airdefense.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/** Mutable authoritative state; mọi mutate bắt buộc đi qua lock theo session. */
public class AirDefenseSession {

    private final ReentrantLock lock = new ReentrantLock();
    private final String sessionId;
    private final String roomId;
    private final Long matchId;
    private final AirDefensePlayMode playMode;
    private final AirDefenseConfig config;
    private final Instant createdAt;
    private final Map<Long, AirDefensePlayerState> players = new LinkedHashMap<>();
    private final Map<String, Aircraft> aircraft = new LinkedHashMap<>();
    private final Map<Long, Deque<AirDefenseQuestion>> questionDecks = new HashMap<>();
    private final Map<Long, Set<String>> processedCommandIds = new HashMap<>();
    private final Set<Long> personalBestUserIds = new HashSet<>();

    private AirDefenseSessionStatus status = AirDefenseSessionStatus.RUNNING;
    private long stateVersion;
    private Instant startedAt;
    private Instant totalDeadlineAt;
    private Instant pausedAt;
    private Instant finishedAt;
    private long pausedTotalMs;
    private Long winnerUserId;
    private boolean draw;
    private AirDefenseOutcome outcome;

    public AirDefenseSession(String sessionId, String roomId, Long matchId,
                             AirDefensePlayMode playMode, AirDefenseConfig config,
                             Instant createdAt) {
        this.sessionId = sessionId;
        this.roomId = roomId;
        this.matchId = matchId;
        this.playMode = playMode;
        this.config = config;
        this.createdAt = createdAt;
        this.startedAt = createdAt;
    }

    public <T> T withLock(Supplier<T> action) {
        lock.lock();
        try { return action.get(); } finally { lock.unlock(); }
    }

    public void withLock(Runnable action) {
        lock.lock();
        try { action.run(); } finally { lock.unlock(); }
    }

    public void addPlayer(AirDefensePlayerState player, List<AirDefenseQuestion> questions) {
        players.put(player.getUserId(), player);
        questionDecks.put(player.getUserId(), new ArrayDeque<>(questions));
        processedCommandIds.put(player.getUserId(), new HashSet<>());
    }

    public Optional<AirDefenseQuestion> nextQuestion(long userId) {
        Deque<AirDefenseQuestion> deck = questionDecks.get(userId);
        return deck == null ? Optional.empty() : Optional.ofNullable(deck.pollFirst());
    }

    public boolean registerCommand(long userId, String commandId) {
        if (commandId == null || commandId.isBlank()) {
            return true;
        }
        Set<String> ids = processedCommandIds.computeIfAbsent(userId, key -> new HashSet<>());
        if (ids.size() > 500) {
            ids.clear();
        }
        return ids.add(commandId);
    }

    public void markPersonalBest(long userId) {
        personalBestUserIds.add(userId);
    }

    public boolean isPersonalBest(long userId) {
        return personalBestUserIds.contains(userId);
    }

    public List<AirDefensePlayerState> orderedPlayers() {
        return players.values().stream()
                .sorted(Comparator.comparingInt(AirDefensePlayerState::getSlot))
                .toList();
    }

    public List<Aircraft> orderedAircraft() {
        return aircraft.values().stream()
                .sorted(Comparator.comparing(Aircraft::getSpawnAt))
                .toList();
    }

    public List<Aircraft> activeAircraftFor(long userId) {
        return aircraft.values().stream()
                .filter(item -> item.getTargetUserId() == userId && item.isActive())
                .sorted(Comparator.comparing(Aircraft::getImpactAt))
                .toList();
    }

    public boolean allQuestionsResolved() {
        return players.values().stream().allMatch(player ->
                player.getAircraftSpawned() >= config.questionCount()
                        && player.getAircraftResolved() >= config.questionCount());
    }

    public void shiftDeadlines(Duration duration) {
        if (totalDeadlineAt != null) totalDeadlineAt = totalDeadlineAt.plus(duration);
        aircraft.values().stream().filter(Aircraft::isActive)
                .forEach(item -> item.shiftDeadline(duration));
        pausedTotalMs += Math.max(0, duration.toMillis());
    }

    public long elapsedMs(Instant now) {
        Instant end = finishedAt == null ? now : finishedAt;
        return Math.max(0, Duration.between(startedAt, end).toMillis() - pausedTotalMs);
    }

    public boolean isParticipant(long userId) { return players.containsKey(userId); }
    public Optional<Aircraft> findAircraft(String aircraftId) { return Optional.ofNullable(aircraft.get(aircraftId)); }
    public void addAircraft(Aircraft item) { aircraft.put(item.getAircraftId(), item); }
    public String getSessionId() { return sessionId; }
    public String getRoomId() { return roomId; }
    public Long getMatchId() { return matchId; }
    public AirDefensePlayMode getPlayMode() { return playMode; }
    public AirDefenseConfig getConfig() { return config; }
    public Instant getCreatedAt() { return createdAt; }
    public Map<Long, AirDefensePlayerState> playersByUserId() { return players; }
    public AirDefenseSessionStatus getStatus() { return status; }
    public void setStatus(AirDefenseSessionStatus status) { this.status = status; }
    public long getStateVersion() { return stateVersion; }
    public long bumpVersion() { return ++stateVersion; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getTotalDeadlineAt() { return totalDeadlineAt; }
    public void setTotalDeadlineAt(Instant totalDeadlineAt) { this.totalDeadlineAt = totalDeadlineAt; }
    public Instant getPausedAt() { return pausedAt; }
    public void setPausedAt(Instant pausedAt) { this.pausedAt = pausedAt; }
    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
    public Long getWinnerUserId() { return winnerUserId; }
    public void setWinnerUserId(Long winnerUserId) { this.winnerUserId = winnerUserId; }
    public boolean isDraw() { return draw; }
    public void setDraw(boolean draw) { this.draw = draw; }
    public AirDefenseOutcome getOutcome() { return outcome; }
    public void setOutcome(AirDefenseOutcome outcome) { this.outcome = outcome; }
}
