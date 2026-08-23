package admin.jlas.game.modules.arena.domain;

import java.time.Instant;

/**
 * Người chơi trong phòng realtime. Mutable nhưng mọi thay đổi đều đi qua
 * {@link GameRoom} dưới lock của phòng, nên không cần đồng bộ riêng.
 */
public class RoomPlayer {

    private final String playerId;
    private final long userId;
    private final String displayName;
    private final String avatar;
    private final Instant joinedAt;

    private boolean ready;
    private boolean connected = true;
    private int slot;
    private Integer team;
    private Instant disconnectedAt;
    private String sessionId;

    public RoomPlayer(String playerId, long userId, String displayName, String avatar,
                      int slot, Integer team, Instant joinedAt) {
        this.playerId = playerId;
        this.userId = userId;
        this.displayName = displayName;
        this.avatar = avatar;
        this.slot = slot;
        this.team = team;
        this.joinedAt = joinedAt;
    }

    public String getPlayerId() {
        return playerId;
    }

    public long getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatar() {
        return avatar;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public boolean isReady() {
        return ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public int getSlot() {
        return slot;
    }

    public void setSlot(int slot) {
        this.slot = slot;
    }

    public Integer getTeam() {
        return team;
    }

    public void setTeam(Integer team) {
        this.team = team;
    }

    public Instant getDisconnectedAt() {
        return disconnectedAt;
    }

    public void setDisconnectedAt(Instant disconnectedAt) {
        this.disconnectedAt = disconnectedAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
