package admin.jlas.game.modules.airdefense.dto;

public final class AirDefenseEventType {
    public static final String SESSION_STATE = "AIR_DEFENSE_SESSION_STATE";
    public static final String AIRCRAFT_SPAWNED = "AIRCRAFT_SPAWNED";
    public static final String ANSWER_CORRECT = "ANSWER_CORRECT";
    public static final String ANSWER_INCORRECT = "ANSWER_INCORRECT";
    public static final String AIRCRAFT_IMPACTED = "AIRCRAFT_IMPACTED";
    public static final String PLAYER_UPDATED = "AIR_DEFENSE_PLAYER_UPDATED";
    public static final String PAUSED = "AIR_DEFENSE_PAUSED";
    public static final String RESUMED = "AIR_DEFENSE_RESUMED";
    public static final String GAME_OVER = "AIR_DEFENSE_GAME_OVER";
    public static final String ERROR = "AIR_DEFENSE_ERROR";

    private AirDefenseEventType() {
    }
}
