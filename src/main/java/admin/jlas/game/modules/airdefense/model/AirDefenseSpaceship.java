package admin.jlas.game.modules.airdefense.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "air_defense_spaceships")
public class AirDefenseSpaceship {

    @Id
    @Column(name = "ship_id", length = 64)
    private String shipId;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "role", nullable = false, length = 32)
    private String role;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_coins", nullable = false)
    private Integer priceCoins;

    @Column(name = "base_hp", nullable = false)
    private Integer baseHp;

    @Column(name = "speed_mult", nullable = false)
    private Double speedMult;

    @Column(name = "passive_skill_code", length = 64)
    private String passiveSkillCode;

    @Column(name = "color_theme", nullable = false, length = 32)
    private String colorTheme;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AirDefenseSpaceship() {}

    public static AirDefenseSpaceshipBuilder builder() {
        return new AirDefenseSpaceshipBuilder();
    }

    public static class AirDefenseSpaceshipBuilder {
        private String shipId;
        private String name;
        private String role;
        private String description;
        private Integer priceCoins;
        private Integer baseHp;
        private Double speedMult;
        private String passiveSkillCode;
        private String colorTheme;
        private LocalDateTime createdAt;

        public AirDefenseSpaceshipBuilder shipId(String shipId) { this.shipId = shipId; return this; }
        public AirDefenseSpaceshipBuilder name(String name) { this.name = name; return this; }
        public AirDefenseSpaceshipBuilder role(String role) { this.role = role; return this; }
        public AirDefenseSpaceshipBuilder description(String description) { this.description = description; return this; }
        public AirDefenseSpaceshipBuilder priceCoins(Integer priceCoins) { this.priceCoins = priceCoins; return this; }
        public AirDefenseSpaceshipBuilder baseHp(Integer baseHp) { this.baseHp = baseHp; return this; }
        public AirDefenseSpaceshipBuilder speedMult(Double speedMult) { this.speedMult = speedMult; return this; }
        public AirDefenseSpaceshipBuilder passiveSkillCode(String passiveSkillCode) { this.passiveSkillCode = passiveSkillCode; return this; }
        public AirDefenseSpaceshipBuilder colorTheme(String colorTheme) { this.colorTheme = colorTheme; return this; }
        public AirDefenseSpaceshipBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AirDefenseSpaceship build() {
            AirDefenseSpaceship s = new AirDefenseSpaceship();
            s.shipId = this.shipId;
            s.name = this.name;
            s.role = this.role;
            s.description = this.description;
            s.priceCoins = this.priceCoins;
            s.baseHp = this.baseHp;
            s.speedMult = this.speedMult;
            s.passiveSkillCode = this.passiveSkillCode;
            s.colorTheme = this.colorTheme;
            s.createdAt = this.createdAt;
            return s;
        }
    }

    public String getShipId() { return shipId; }
    public void setShipId(String shipId) { this.shipId = shipId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPriceCoins() { return priceCoins; }
    public void setPriceCoins(Integer priceCoins) { this.priceCoins = priceCoins; }

    public Integer getBaseHp() { return baseHp; }
    public void setBaseHp(Integer baseHp) { this.baseHp = baseHp; }

    public Double getSpeedMult() { return speedMult; }
    public void setSpeedMult(Double speedMult) { this.speedMult = speedMult; }

    public String getPassiveSkillCode() { return passiveSkillCode; }
    public void setPassiveSkillCode(String passiveSkillCode) { this.passiveSkillCode = passiveSkillCode; }

    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
