package admin.jlas.game.modules.airdefense.domain;

public enum AircraftState {
    SPAWNING,
    ACTIVE,
    HIT,
    DESTROYED,
    IMPACTED;

    public boolean isResolved() {
        return this == DESTROYED || this == IMPACTED;
    }
}
