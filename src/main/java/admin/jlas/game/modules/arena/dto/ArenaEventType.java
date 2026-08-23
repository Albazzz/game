package admin.jlas.game.modules.arena.dto;

/** Tên event WebSocket (p1.md §8) — dùng hằng số để client/server không lệch nhau. */
public final class ArenaEventType {

    // server -> client
    public static final String ROOM_STATE = "ROOM_STATE";
    public static final String PLAYER_JOINED = "PLAYER_JOINED";
    public static final String PLAYER_LEFT = "PLAYER_LEFT";
    public static final String PLAYER_UPDATED = "PLAYER_UPDATED";
    public static final String PLAYER_RECONNECTED = "PLAYER_RECONNECTED";
    public static final String ROOM_SETTINGS_UPDATED = "ROOM_SETTINGS_UPDATED";
    public static final String COUNTDOWN_STARTED = "COUNTDOWN_STARTED";
    public static final String GAME_STARTED = "GAME_STARTED";
    public static final String GAME_FINISHED = "GAME_FINISHED";
    public static final String HOST_CHANGED = "HOST_CHANGED";
    public static final String ROOM_CLOSED = "ROOM_CLOSED";
    public static final String ROOM_ERROR = "ROOM_ERROR";

    private ArenaEventType() {
    }
}
