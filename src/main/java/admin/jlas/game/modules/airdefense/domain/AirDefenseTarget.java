package admin.jlas.game.modules.airdefense.domain;

import java.util.List;

public class AirDefenseTarget {

    private String id;
    private String term;
    private String reading;
    private String meaning;
    private List<String> aliases;
    private AirDefenseTargetType type;
    private double posX; // 0..100 percentage
    private double posY; // 0..100 percentage (falls from 0 to 100)
    private double speed;
    private int maxHp;
    private int currentHp;
    private boolean isDead;
    private long spawnedAt;

    public AirDefenseTarget() {}

    public static AirDefenseTargetBuilder builder() {
        return new AirDefenseTargetBuilder();
    }

    public static class AirDefenseTargetBuilder {
        private String id;
        private String term;
        private String reading;
        private String meaning;
        private List<String> aliases;
        private AirDefenseTargetType type;
        private double posX;
        private double posY;
        private double speed;
        private int maxHp;
        private int currentHp;
        private boolean isDead;
        private long spawnedAt;

        public AirDefenseTargetBuilder id(String id) { this.id = id; return this; }
        public AirDefenseTargetBuilder term(String term) { this.term = term; return this; }
        public AirDefenseTargetBuilder reading(String reading) { this.reading = reading; return this; }
        public AirDefenseTargetBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public AirDefenseTargetBuilder aliases(List<String> aliases) { this.aliases = aliases; return this; }
        public AirDefenseTargetBuilder type(AirDefenseTargetType type) { this.type = type; return this; }
        public AirDefenseTargetBuilder posX(double posX) { this.posX = posX; return this; }
        public AirDefenseTargetBuilder posY(double posY) { this.posY = posY; return this; }
        public AirDefenseTargetBuilder speed(double speed) { this.speed = speed; return this; }
        public AirDefenseTargetBuilder maxHp(int maxHp) { this.maxHp = maxHp; return this; }
        public AirDefenseTargetBuilder currentHp(int currentHp) { this.currentHp = currentHp; return this; }
        public AirDefenseTargetBuilder isDead(boolean isDead) { this.isDead = isDead; return this; }
        public AirDefenseTargetBuilder spawnedAt(long spawnedAt) { this.spawnedAt = spawnedAt; return this; }

        public AirDefenseTarget build() {
            AirDefenseTarget t = new AirDefenseTarget();
            t.id = this.id;
            t.term = this.term;
            t.reading = this.reading;
            t.meaning = this.meaning;
            t.aliases = this.aliases;
            t.type = this.type;
            t.posX = this.posX;
            t.posY = this.posY;
            t.speed = this.speed;
            t.maxHp = this.maxHp;
            t.currentHp = this.currentHp;
            t.isDead = this.isDead;
            t.spawnedAt = this.spawnedAt;
            return t;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public List<String> getAliases() { return aliases; }
    public void setAliases(List<String> aliases) { this.aliases = aliases; }

    public AirDefenseTargetType getType() { return type; }
    public void setType(AirDefenseTargetType type) { this.type = type; }

    public double getPosX() { return posX; }
    public void setPosX(double posX) { this.posX = posX; }

    public double getPosY() { return posY; }
    public void setPosY(double posY) { this.posY = posY; }

    public double getSpeed() { return speed; }
    public void setSpeed(double speed) { this.speed = speed; }

    public int getMaxHp() { return maxHp; }
    public void setMaxHp(int maxHp) { this.maxHp = maxHp; }

    public int getCurrentHp() { return currentHp; }
    public void setCurrentHp(int currentHp) { this.currentHp = currentHp; }

    public boolean isDead() { return isDead; }
    public void setDead(boolean dead) { isDead = dead; }

    public long getSpawnedAt() { return spawnedAt; }
    public void setSpawnedAt(long spawnedAt) { this.spawnedAt = spawnedAt; }
}
