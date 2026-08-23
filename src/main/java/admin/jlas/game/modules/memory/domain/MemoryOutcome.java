package admin.jlas.game.modules.memory.domain;

/** Kết quả cuối ván. Solo dùng CLEARED/FAILED, multiplayer dùng CLEARED. */
public enum MemoryOutcome {
    CLEARED,
    TIME_UP,
    MOVES_EXHAUSTED,
    ABANDONED
}
