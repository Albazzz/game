package admin.jlas.game.modules.airdefense.domain;

import java.util.ArrayList;
import java.util.List;

public class AirDefensePlayerState {

    private Long userId;
    private String username;
    private String displayName;
    private String avatarUrl;

    private int hp = 100;
    private int maxHp = 100;
    private int shield = 0;
    private int score = 0;
    private int combo = 0;
    private int bestCombo = 0;
    private int creditsEarned = 0;
    private int hyperBeamCharge = 0; // 0..100%
    private int remainingRerolls = 3;
    private int correctAnswers = 0;
    private int incorrectAnswers = 0;

    private String equippedShipId = "NOVA-01";
    private double shipSpeedMult = 1.0;
    private String passiveSkillCode;

    private List<AugmentType> activeAugments = new ArrayList<>();
    private List<String> weakWords = new ArrayList<>();

    private boolean isEliminated;

    public AirDefensePlayerState() {}

    public static AirDefensePlayerStateBuilder builder() {
        return new AirDefensePlayerStateBuilder();
    }

    public static class AirDefensePlayerStateBuilder {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private int hp = 100;
        private int maxHp = 100;
        private int shield = 0;
        private int score = 0;
        private int combo = 0;
        private int bestCombo = 0;
        private int creditsEarned = 0;
        private int hyperBeamCharge = 0;
        private int remainingRerolls = 3;
        private int correctAnswers = 0;
        private int incorrectAnswers = 0;
        private String equippedShipId = "NOVA-01";
        private double shipSpeedMult = 1.0;
        private String passiveSkillCode;
        private List<AugmentType> activeAugments = new ArrayList<>();
        private List<String> weakWords = new ArrayList<>();
        private boolean isEliminated;

        public AirDefensePlayerStateBuilder userId(Long userId) { this.userId = userId; return this; }
        public AirDefensePlayerStateBuilder username(String username) { this.username = username; return this; }
        public AirDefensePlayerStateBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public AirDefensePlayerStateBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public AirDefensePlayerStateBuilder hp(int hp) { this.hp = hp; return this; }
        public AirDefensePlayerStateBuilder maxHp(int maxHp) { this.maxHp = maxHp; return this; }
        public AirDefensePlayerStateBuilder shield(int shield) { this.shield = shield; return this; }
        public AirDefensePlayerStateBuilder score(int score) { this.score = score; return this; }
        public AirDefensePlayerStateBuilder combo(int combo) { this.combo = combo; return this; }
        public AirDefensePlayerStateBuilder bestCombo(int bestCombo) { this.bestCombo = bestCombo; return this; }
        public AirDefensePlayerStateBuilder creditsEarned(int creditsEarned) { this.creditsEarned = creditsEarned; return this; }
        public AirDefensePlayerStateBuilder hyperBeamCharge(int hyperBeamCharge) { this.hyperBeamCharge = hyperBeamCharge; return this; }
        public AirDefensePlayerStateBuilder remainingRerolls(int remainingRerolls) { this.remainingRerolls = remainingRerolls; return this; }
        public AirDefensePlayerStateBuilder correctAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; return this; }
        public AirDefensePlayerStateBuilder incorrectAnswers(int incorrectAnswers) { this.incorrectAnswers = incorrectAnswers; return this; }
        public AirDefensePlayerStateBuilder equippedShipId(String equippedShipId) { this.equippedShipId = equippedShipId; return this; }
        public AirDefensePlayerStateBuilder shipSpeedMult(double shipSpeedMult) { this.shipSpeedMult = shipSpeedMult; return this; }
        public AirDefensePlayerStateBuilder passiveSkillCode(String passiveSkillCode) { this.passiveSkillCode = passiveSkillCode; return this; }
        public AirDefensePlayerStateBuilder activeAugments(List<AugmentType> activeAugments) { this.activeAugments = activeAugments; return this; }
        public AirDefensePlayerStateBuilder weakWords(List<String> weakWords) { this.weakWords = weakWords; return this; }
        public AirDefensePlayerStateBuilder isEliminated(boolean isEliminated) { this.isEliminated = isEliminated; return this; }

        public AirDefensePlayerState build() {
            AirDefensePlayerState p = new AirDefensePlayerState();
            p.userId = this.userId;
            p.username = this.username;
            p.displayName = this.displayName;
            p.avatarUrl = this.avatarUrl;
            p.hp = this.hp;
            p.maxHp = this.maxHp;
            p.shield = this.shield;
            p.score = this.score;
            p.combo = this.combo;
            p.bestCombo = this.bestCombo;
            p.creditsEarned = this.creditsEarned;
            p.hyperBeamCharge = this.hyperBeamCharge;
            p.remainingRerolls = this.remainingRerolls;
            p.correctAnswers = this.correctAnswers;
            p.incorrectAnswers = this.incorrectAnswers;
            p.equippedShipId = this.equippedShipId;
            p.shipSpeedMult = this.shipSpeedMult;
            p.passiveSkillCode = this.passiveSkillCode;
            if (this.activeAugments != null) p.activeAugments = this.activeAugments;
            if (this.weakWords != null) p.weakWords = this.weakWords;
            p.isEliminated = this.isEliminated;
            return p;
        }
    }

    public void addScore(int delta) {
        this.score += delta;
    }

    public void incrementCombo() {
        this.combo++;
        if (this.combo > this.bestCombo) {
            this.bestCombo = this.combo;
        }
        this.hyperBeamCharge = Math.min(100, this.hyperBeamCharge + 8);
    }

    public void resetCombo() {
        this.combo = 0;
    }

    public void takeDamage(int amount) {
        if (shield > 0) {
            shield--;
            return;
        }
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0) {
            this.isEliminated = true;
        }
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public int getHp() { return hp; }
    public void setHp(int hp) { this.hp = hp; }

    public int getMaxHp() { return maxHp; }
    public void setMaxHp(int maxHp) { this.maxHp = maxHp; }

    public int getShield() { return shield; }
    public void setShield(int shield) { this.shield = shield; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getCombo() { return combo; }
    public void setCombo(int combo) { this.combo = combo; }

    public int getBestCombo() { return bestCombo; }
    public void setBestCombo(int bestCombo) { this.bestCombo = bestCombo; }

    public int getCreditsEarned() { return creditsEarned; }
    public void setCreditsEarned(int creditsEarned) { this.creditsEarned = creditsEarned; }

    public int getHyperBeamCharge() { return hyperBeamCharge; }
    public void setHyperBeamCharge(int hyperBeamCharge) { this.hyperBeamCharge = hyperBeamCharge; }

    public int getRemainingRerolls() { return remainingRerolls; }
    public void setRemainingRerolls(int remainingRerolls) { this.remainingRerolls = remainingRerolls; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public int getIncorrectAnswers() { return incorrectAnswers; }
    public void setIncorrectAnswers(int incorrectAnswers) { this.incorrectAnswers = incorrectAnswers; }

    public String getEquippedShipId() { return equippedShipId; }
    public void setEquippedShipId(String equippedShipId) { this.equippedShipId = equippedShipId; }

    public double getShipSpeedMult() { return shipSpeedMult; }
    public void setShipSpeedMult(double shipSpeedMult) { this.shipSpeedMult = shipSpeedMult; }

    public String getPassiveSkillCode() { return passiveSkillCode; }
    public void setPassiveSkillCode(String passiveSkillCode) { this.passiveSkillCode = passiveSkillCode; }

    public List<AugmentType> getActiveAugments() { return activeAugments; }
    public void setActiveAugments(List<AugmentType> activeAugments) { this.activeAugments = activeAugments; }

    public List<String> getWeakWords() { return weakWords; }
    public void setWeakWords(List<String> weakWords) { this.weakWords = weakWords; }

    public boolean isEliminated() { return isEliminated; }
    public void setEliminated(boolean eliminated) { isEliminated = eliminated; }
}
