package admin.jlas.game.modules.airdefense.domain;

public enum AirDefenseDifficulty {
    EASY(18_000, 5_500),
    NORMAL(14_000, 4_500),
    HARD(10_000, 3_500);

    private final int travelTimeMs;
    private final int spawnIntervalMs;

    AirDefenseDifficulty(int travelTimeMs, int spawnIntervalMs) {
        this.travelTimeMs = travelTimeMs;
        this.spawnIntervalMs = spawnIntervalMs;
    }

    public int travelTimeMs() {
        return travelTimeMs;
    }

    public int spawnIntervalMs() {
        return spawnIntervalMs;
    }
}
