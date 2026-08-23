package admin.jlas.game.modules.airdefense.domain;

import java.util.ArrayList;
import java.util.List;

public class AirDefensePlayerState {

    private final long userId;
    /** Principal name (email), chỉ dùng server-side cho /user queue. */
    private final String username;
    private final String displayName;
    private final String avatar;
    private final int slot;
    private final int maxHp;
    private final List<AirDefenseAnswerRecord> answerHistory = new ArrayList<>();

    private int hp;
    private int score;
    private int combo;
    private int bestCombo;
    private int correctAnswers;
    private int incorrectAnswers;
    private int aircraftSpawned;
    private int aircraftResolved;
    private long totalResponseMs;
    private boolean connected = true;

    public AirDefensePlayerState(long userId, String username, String displayName,
                                 String avatar, int slot, int maxHp) {
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.avatar = avatar;
        this.slot = slot;
        this.maxHp = maxHp;
        this.hp = maxHp;
    }

    public void recordCorrect(AirDefenseAnswerRecord record) {
        correctAnswers++;
        aircraftResolved++;
        combo++;
        bestCombo = Math.max(bestCombo, combo);
        score += 100 + Math.min(100, Math.max(0, combo - 1) * 10);
        totalResponseMs += Math.max(0, record.responseMs());
        answerHistory.add(record);
    }

    public void recordIncorrect(AirDefenseAnswerRecord record) {
        incorrectAnswers++;
        combo = 0;
        totalResponseMs += Math.max(0, record.responseMs());
        answerHistory.add(record);
    }

    public void recordImpact(AirDefenseAnswerRecord record) {
        incorrectAnswers++;
        aircraftResolved++;
        combo = 0;
        hp = Math.max(0, hp - 1);
        totalResponseMs += Math.max(0, record.responseMs());
        answerHistory.add(record);
    }

    public int accuracyPercent() {
        int attempts = correctAnswers + incorrectAnswers;
        return attempts == 0 ? 100 : (int) Math.round(correctAnswers * 100.0 / attempts);
    }

    public Integer averageResponseMs() {
        int attempts = correctAnswers + incorrectAnswers;
        return attempts == 0 ? null : (int) Math.min(Integer.MAX_VALUE, totalResponseMs / attempts);
    }

    public long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getAvatar() { return avatar; }
    public int getSlot() { return slot; }
    public int getMaxHp() { return maxHp; }
    public int getHp() { return hp; }
    public int getScore() { return score; }
    public int getCombo() { return combo; }
    public int getBestCombo() { return bestCombo; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getIncorrectAnswers() { return incorrectAnswers; }
    public int getAircraftSpawned() { return aircraftSpawned; }
    public int getAircraftResolved() { return aircraftResolved; }
    public List<AirDefenseAnswerRecord> getAnswerHistory() { return List.copyOf(answerHistory); }
    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }
    public void incrementAircraftSpawned() { aircraftSpawned++; }
}
