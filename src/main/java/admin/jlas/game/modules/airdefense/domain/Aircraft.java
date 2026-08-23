package admin.jlas.game.modules.airdefense.domain;

import java.time.Duration;
import java.time.Instant;

public class Aircraft {

    private final String aircraftId;
    private final AirDefenseQuestion question;
    private final long targetUserId;
    private final AirDefenseDifficulty difficulty;
    private final AircraftType aircraftType;
    private final int routeIndex;
    private Instant spawnAt;
    private Instant impactAt;
    private AircraftState state = AircraftState.ACTIVE;
    private Instant resolvedAt;
    private Long resolvedByUserId;

    public Aircraft(String aircraftId, AirDefenseQuestion question, long targetUserId,
                    AirDefenseDifficulty difficulty, int routeIndex,
                    Instant spawnAt, Instant impactAt) {
        this.aircraftId = aircraftId;
        this.question = question;
        this.targetUserId = targetUserId;
        this.difficulty = difficulty;
        this.aircraftType = AircraftType.NORMAL;
        this.routeIndex = routeIndex;
        this.spawnAt = spawnAt;
        this.impactAt = impactAt;
    }

    public boolean isActive() {
        return state == AircraftState.ACTIVE || state == AircraftState.SPAWNING;
    }

    public void destroy(long userId, Instant now) {
        state = AircraftState.DESTROYED;
        resolvedAt = now;
        resolvedByUserId = userId;
    }

    public void impact(Instant now) {
        state = AircraftState.IMPACTED;
        resolvedAt = now;
    }

    public void shiftDeadline(Duration duration) {
        spawnAt = spawnAt.plus(duration);
        impactAt = impactAt.plus(duration);
    }

    public String getAircraftId() { return aircraftId; }
    public AirDefenseQuestion getQuestion() { return question; }
    public long getTargetUserId() { return targetUserId; }
    public AirDefenseDifficulty getDifficulty() { return difficulty; }
    public AircraftType getAircraftType() { return aircraftType; }
    public int getRouteIndex() { return routeIndex; }
    public Instant getSpawnAt() { return spawnAt; }
    public Instant getImpactAt() { return impactAt; }
    public AircraftState getState() { return state; }
    public Instant getResolvedAt() { return resolvedAt; }
    public Long getResolvedByUserId() { return resolvedByUserId; }
}
