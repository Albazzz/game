package admin.jlas.game.modules.memory.dto;

/** Tên event Memory Match (server -> client). */
public final class MemoryEventType {

    public static final String SESSION_STATE = "MEMORY_SESSION_STATE";
    public static final String CARD_REVEALED = "MEMORY_CARD_REVEALED";
    public static final String PAIR_MATCHED = "MEMORY_PAIR_MATCHED";
    public static final String PAIR_MISMATCH = "MEMORY_PAIR_MISMATCH";
    public static final String CARDS_HIDDEN = "MEMORY_CARDS_HIDDEN";
    public static final String NEXT_TURN = "MEMORY_NEXT_TURN";
    public static final String TURN_TIMEOUT = "MEMORY_TURN_TIMEOUT";
    public static final String PLAYER_UPDATED = "MEMORY_PLAYER_UPDATED";
    public static final String PAUSED = "MEMORY_PAUSED";
    public static final String RESUMED = "MEMORY_RESUMED";
    public static final String GAME_OVER = "MEMORY_GAME_OVER";
    public static final String ERROR = "MEMORY_ERROR";

    private MemoryEventType() {
    }
}
