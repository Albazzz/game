package admin.jlas.game.modules.memory.domain;

/** Thống kê từng người chơi trong ván. Server là nơi duy nhất cộng điểm. */
public class MemoryPlayerState {

    private final long userId;
    private final String displayName;
    private final String avatar;
    private final int slot;

    private int pairsFound;
    private int mistakes;
    private int moves;
    private int streak;
    private int bestStreak;
    private long totalDecisionMs;
    private int decisionSamples;
    private boolean connected = true;

    public MemoryPlayerState(long userId, String displayName, String avatar, int slot) {
        this.userId = userId;
        this.displayName = displayName;
        this.avatar = avatar;
        this.slot = slot;
    }

    public long getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatar() {
        return avatar;
    }

    public int getSlot() {
        return slot;
    }

    public int getPairsFound() {
        return pairsFound;
    }

    public int getMistakes() {
        return mistakes;
    }

    public int getMoves() {
        return moves;
    }

    public int getStreak() {
        return streak;
    }

    public int getBestStreak() {
        return bestStreak;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public void recordMove() {
        moves++;
    }

    public void recordMatch() {
        pairsFound++;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
    }

    public void recordMistake() {
        mistakes++;
        streak = 0;
    }

    public void recordDecision(long millis) {
        if (millis <= 0) {
            return;
        }
        totalDecisionMs += millis;
        decisionSamples++;
    }

    public Integer averageDecisionMs() {
        return decisionSamples == 0 ? null : (int) (totalDecisionMs / decisionSamples);
    }

    /** Độ chính xác theo số lượt ghép (mỗi lượt = 2 thẻ). */
    public Integer accuracyPercent() {
        int attempts = pairsFound + mistakes;
        return attempts == 0 ? null : (int) Math.round(pairsFound * 100.0 / attempts);
    }
}
