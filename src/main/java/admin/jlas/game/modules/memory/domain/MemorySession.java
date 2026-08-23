package admin.jlas.game.modules.memory.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * State authoritative của một ván Memory Match, giữ trong bộ nhớ server.
 * Mọi mutate phải chạy trong {@link #withLock(Supplier)} vì flip của nhiều
 * người chơi và timer của scheduler có thể tới đồng thời (rule.md §9, §10).
 */
public class MemorySession {

    private final ReentrantLock lock = new ReentrantLock();

    private final String sessionId;
    /** Null với solo — solo không đi qua phòng. */
    private final String roomId;
    private final Long matchId;
    private final MemoryPlayMode playMode;
    private final MemoryConfig config;
    private final Instant createdAt;

    /** position -> card, index = position để lookup O(1). */
    private final List<MemoryCard> cards;
    private final Map<String, MemoryCard> cardsById = new LinkedHashMap<>();
    /** userId -> state, thứ tự = thứ tự lượt. */
    private final Map<Long, MemoryPlayerState> players = new LinkedHashMap<>();
    private final List<Long> turnOrder = new ArrayList<>();
    /** pairId -> số lần đoán sai, để gợi ý từ cần ôn lại. */
    private final Map<Integer, Integer> mistakesByPair = new LinkedHashMap<>();
    /** pairId -> từ vựng gốc, dùng cho màn kết quả (không gửi giữa ván). */
    private final Map<Integer, MemoryPairInfo> pairInfoById;

    private MemorySessionStatus status = MemorySessionStatus.RUNNING;
    private long stateVersion;
    private long currentTurnUserId;
    /** Thẻ đang TEMP_REVEALED của lượt hiện tại (tối đa 2). */
    private final List<String> selection = new ArrayList<>();
    /** True trong lúc chờ ẩn thẻ mismatch — chặn flip thẻ thứ ba. */
    private boolean resolving;
    private Instant turnStartedAt;
    private Instant turnDeadlineAt;
    private Instant firstFlipAt;
    private Instant totalDeadlineAt;
    private Instant pausedAt;
    private Instant finishedAt;
    private long pausedTotalMs;
    private int movesUsed;
    private int pairsMatched;
    private MemoryOutcome outcome;

    public MemorySession(String sessionId, String roomId, Long matchId, MemoryPlayMode playMode,
                         MemoryConfig config, List<MemoryCard> cards,
                         Map<Integer, MemoryPairInfo> pairInfoById, Instant createdAt) {
        this.sessionId = sessionId;
        this.roomId = roomId;
        this.matchId = matchId;
        this.playMode = playMode;
        this.config = config;
        this.cards = List.copyOf(cards);
        this.pairInfoById = Map.copyOf(pairInfoById);
        this.createdAt = createdAt;
        for (MemoryCard card : this.cards) {
            cardsById.put(card.getCardInstanceId(), card);
        }
    }

    public <T> T withLock(Supplier<T> action) {
        lock.lock();
        try {
            return action.get();
        } finally {
            lock.unlock();
        }
    }

    public void withLock(Runnable action) {
        lock.lock();
        try {
            action.run();
        } finally {
            lock.unlock();
        }
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getRoomId() {
        return roomId;
    }

    public Long getMatchId() {
        return matchId;
    }

    public MemoryPlayMode getPlayMode() {
        return playMode;
    }

    public MemoryConfig getConfig() {
        return config;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<MemoryCard> getCards() {
        return cards;
    }

    public Optional<MemoryCard> findCard(String cardInstanceId) {
        return cardInstanceId == null
                ? Optional.empty()
                : Optional.ofNullable(cardsById.get(cardInstanceId));
    }

    public Map<Long, MemoryPlayerState> playersByUserId() {
        return players;
    }

    public List<MemoryPlayerState> orderedPlayers() {
        List<MemoryPlayerState> ordered = new ArrayList<>(players.values());
        ordered.sort(Comparator.comparingInt(MemoryPlayerState::getSlot));
        return ordered;
    }

    public void addPlayer(MemoryPlayerState player) {
        players.put(player.getUserId(), player);
        turnOrder.add(player.getUserId());
        if (turnOrder.size() == 1) {
            currentTurnUserId = player.getUserId();
        }
    }

    public boolean isParticipant(long userId) {
        return players.containsKey(userId);
    }

    public Map<Integer, MemoryPairInfo> pairInfo() {
        return pairInfoById;
    }

    public Map<Integer, Integer> getMistakesByPair() {
        return mistakesByPair;
    }

    public void recordPairMistake(int pairId) {
        mistakesByPair.merge(pairId, 1, Integer::sum);
    }

    // ===================== STATUS =====================

    public MemorySessionStatus getStatus() {
        return status;
    }

    public void setStatus(MemorySessionStatus status) {
        this.status = status;
    }

    public long getStateVersion() {
        return stateVersion;
    }

    public long bumpVersion() {
        return ++stateVersion;
    }

    public MemoryOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(MemoryOutcome outcome) {
        this.outcome = outcome;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }

    // ===================== TURN =====================

    public long getCurrentTurnUserId() {
        return currentTurnUserId;
    }

    public boolean isMyTurn(long userId) {
        return currentTurnUserId == userId;
    }

    /** Người tiếp theo còn trong ván; bỏ qua player đã rời. */
    public long nextTurnUserId() {
        if (turnOrder.isEmpty()) {
            return currentTurnUserId;
        }
        int index = turnOrder.indexOf(currentTurnUserId);
        for (int step = 1; step <= turnOrder.size(); step++) {
            long candidate = turnOrder.get((index + step) % turnOrder.size());
            if (players.containsKey(candidate)) {
                return candidate;
            }
        }
        return currentTurnUserId;
    }

    public void setCurrentTurnUserId(long userId) {
        this.currentTurnUserId = userId;
    }

    public List<String> getSelection() {
        return selection;
    }

    public boolean isResolving() {
        return resolving;
    }

    public void setResolving(boolean resolving) {
        this.resolving = resolving;
    }

    public int getMovesUsed() {
        return movesUsed;
    }

    public void incrementMoves() {
        movesUsed++;
    }

    public int getPairsMatched() {
        return pairsMatched;
    }

    public void incrementPairsMatched() {
        pairsMatched++;
    }

    public boolean isBoardCleared() {
        return pairsMatched >= config.pairCount();
    }

    public boolean isMoveBudgetExhausted() {
        return config.moveLimit() != null && movesUsed >= config.moveLimit();
    }

    public Integer movesRemaining() {
        return config.moveLimit() == null ? null : Math.max(0, config.moveLimit() - movesUsed);
    }

    // ===================== TIMERS =====================

    public Instant getTurnStartedAt() {
        return turnStartedAt;
    }

    public Instant getTurnDeadlineAt() {
        return turnDeadlineAt;
    }

    public Instant getTotalDeadlineAt() {
        return totalDeadlineAt;
    }

    public void setTotalDeadlineAt(Instant totalDeadlineAt) {
        this.totalDeadlineAt = totalDeadlineAt;
    }

    public Instant getFirstFlipAt() {
        return firstFlipAt;
    }

    public void setFirstFlipAt(Instant firstFlipAt) {
        this.firstFlipAt = firstFlipAt;
    }

    public Instant getPausedAt() {
        return pausedAt;
    }

    public void setPausedAt(Instant pausedAt) {
        this.pausedAt = pausedAt;
    }

    public long getPausedTotalMs() {
        return pausedTotalMs;
    }

    public void addPausedMs(long millis) {
        pausedTotalMs += Math.max(0, millis);
    }

    public void startTurn(Instant now) {
        this.turnStartedAt = now;
        this.turnDeadlineAt = now.plusSeconds(config.turnSeconds());
        this.firstFlipAt = null;
    }

    /** Dịch deadline sau khi resume — server sở hữu thời gian, không phải client. */
    public void shiftDeadlines(Duration by) {
        if (turnDeadlineAt != null) {
            turnDeadlineAt = turnDeadlineAt.plus(by);
        }
        if (turnStartedAt != null) {
            turnStartedAt = turnStartedAt.plus(by);
        }
        if (totalDeadlineAt != null) {
            totalDeadlineAt = totalDeadlineAt.plus(by);
        }
    }

    /** Solo mới được pause (p2-memory §1A). */
    public boolean supportsPause() {
        return playMode == MemoryPlayMode.SOLO;
    }

    public long elapsedMs(Instant now) {
        Instant end = finishedAt != null ? finishedAt : now;
        long raw = Duration.between(createdAt, end).toMillis();
        return Math.max(0, raw - pausedTotalMs);
    }
}
