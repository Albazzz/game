package admin.jlas.game.modules.arena.domain;

public enum RoomStatus {
    WAITING,
    COUNTDOWN,
    IN_GAME,
    FINISHED,
    CLOSED;

    public boolean isJoinable() {
        return this == WAITING;
    }

    public boolean isTerminal() {
        return this == FINISHED || this == CLOSED;
    }
}
