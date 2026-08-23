package admin.jlas.game.modules.memory.domain;

public enum MemorySessionStatus {
    RUNNING,
    PAUSED,
    FINISHED,
    ABORTED;

    public boolean isTerminal() {
        return this == FINISHED || this == ABORTED;
    }
}
