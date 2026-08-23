package admin.jlas.game.modules.arena.domain;

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
 * Trạng thái phòng authoritative, giữ trong bộ nhớ server (rule.md: không ghi DB
 * cho state tạm thời). Mọi mutate phải chạy trong {@link #withLock(Supplier)} vì
 * message của nhiều player có thể tới đồng thời.
 */
public class GameRoom {

    private final ReentrantLock lock = new ReentrantLock();

    private final String roomId;
    private final String roomCode;
    private final GameType gameType;
    private final RoomVisibility visibility;
    private final int maxPlayers;
    private final Instant createdAt;

    /** userId -> player. LinkedHashMap giữ thứ tự join để host migration xác định. */
    private final Map<Long, RoomPlayer> players = new LinkedHashMap<>();

    private long hostUserId;
    private RoomStatus status = RoomStatus.WAITING;
    private GameSettings settings;
    private Instant lastActivityAt;
    private Instant countdownStartAt;
    private Instant countdownEndAt;
    private long stateVersion;
    private String currentMatchRef;
    /** sessionId của engine gameplay (Phase 2+); null khi còn ở phòng chờ. */
    private String currentSessionId;

    public GameRoom(String roomId, String roomCode, GameType gameType, RoomVisibility visibility,
                    int maxPlayers, long hostUserId, GameSettings settings, Instant createdAt) {
        this.roomId = roomId;
        this.roomCode = roomCode;
        this.gameType = gameType;
        this.visibility = visibility;
        this.maxPlayers = maxPlayers;
        this.hostUserId = hostUserId;
        this.settings = settings;
        this.createdAt = createdAt;
        this.lastActivityAt = createdAt;
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

    public String getRoomId() {
        return roomId;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public GameType getGameType() {
        return gameType;
    }

    public RoomVisibility getVisibility() {
        return visibility;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public long getHostUserId() {
        return hostUserId;
    }

    public void setHostUserId(long hostUserId) {
        this.hostUserId = hostUserId;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public GameSettings getSettings() {
        return settings;
    }

    public void setSettings(GameSettings settings) {
        this.settings = settings;
    }

    public Instant getLastActivityAt() {
        return lastActivityAt;
    }

    public void touch(Instant now) {
        this.lastActivityAt = now;
    }

    public Instant getCountdownStartAt() {
        return countdownStartAt;
    }

    public void setCountdownStartAt(Instant countdownStartAt) {
        this.countdownStartAt = countdownStartAt;
    }

    public Instant getCountdownEndAt() {
        return countdownEndAt;
    }

    public void setCountdownEndAt(Instant countdownEndAt) {
        this.countdownEndAt = countdownEndAt;
    }

    public long getStateVersion() {
        return stateVersion;
    }

    public long bumpVersion() {
        return ++stateVersion;
    }

    public String getCurrentMatchRef() {
        return currentMatchRef;
    }

    public void setCurrentMatchRef(String currentMatchRef) {
        this.currentMatchRef = currentMatchRef;
    }

    public String getCurrentSessionId() {
        return currentSessionId;
    }

    public void setCurrentSessionId(String currentSessionId) {
        this.currentSessionId = currentSessionId;
    }

    public Map<Long, RoomPlayer> playersByUserId() {
        return players;
    }

    /** Danh sách player theo slot tăng dần (view ổn định cho UI). */
    public List<RoomPlayer> orderedPlayers() {
        List<RoomPlayer> ordered = new ArrayList<>(players.values());
        ordered.sort(Comparator.comparingInt(RoomPlayer::getSlot));
        return ordered;
    }

    public Optional<RoomPlayer> findPlayer(long userId) {
        return Optional.ofNullable(players.get(userId));
    }

    public boolean isHost(long userId) {
        return hostUserId == userId;
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public int playerCount() {
        return players.size();
    }

    public boolean isEmpty() {
        return players.isEmpty();
    }

    /** Slot nhỏ nhất còn trống trong [0, maxPlayers). */
    public int nextFreeSlot() {
        boolean[] taken = new boolean[maxPlayers];
        for (RoomPlayer player : players.values()) {
            if (player.getSlot() >= 0 && player.getSlot() < maxPlayers) {
                taken[player.getSlot()] = true;
            }
        }
        for (int i = 0; i < maxPlayers; i++) {
            if (!taken[i]) {
                return i;
            }
        }
        return players.size();
    }

    /**
     * Điều kiện bắt đầu (p1.md §6): đủ số người theo metadata, mọi player đang
     * kết nối, và tất cả người không phải host đã ready.
     */
    public boolean canStart() {
        return startBlockedReason() == null;
    }

    /** Lý do chưa start được — UI đọc từ server thay vì tự suy luận. */
    public String startBlockedReason() {
        GameRuleMetadata metadata = GameRuleMetadata.of(gameType);
        if (status != RoomStatus.WAITING) {
            return "Phòng không ở trạng thái chờ";
        }
        int count = players.size();
        if (count < metadata.minPlayers()) {
            return "Cần tối thiểu " + metadata.minPlayers() + " người chơi";
        }
        if (count > metadata.maxPlayers()) {
            return "Quá số người chơi cho phép";
        }
        for (RoomPlayer player : players.values()) {
            if (!player.isConnected()) {
                return "Đang chờ " + player.getDisplayName() + " kết nối lại";
            }
        }
        for (RoomPlayer player : players.values()) {
            if (player.getUserId() != hostUserId && !player.isReady()) {
                return "Đang chờ người chơi sẵn sàng";
            }
        }
        return null;
    }
}
