package admin.jlas.game.modules.airdefense.domain;

public enum AirDefenseSessionStatus {
    RUNNING,
    PAUSED,
    FINISHED,
    ABORTED;

    public boolean isTerminal() {
        return this == FINISHED || this == ABORTED;
    }
}
