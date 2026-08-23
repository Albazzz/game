package admin.jlas.game.modules.airdefense.model;

import admin.jlas.game.modules.auth.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_permanent_upgrades")
public class UserPermanentUpgrade {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "coins_balance", nullable = false)
    private Integer coinsBalance = 0;

    @Column(name = "extra_base_hp_level", nullable = false)
    private Integer extraBaseHpLevel = 0;

    @Column(name = "coin_bonus_level", nullable = false)
    private Integer coinBonusLevel = 0;

    @Column(name = "reroll_count_level", nullable = false)
    private Integer rerollCountLevel = 0;

    @Column(name = "fast_start_level", nullable = false)
    private Integer fastStartLevel = 0;

    @Column(name = "equipped_ship_id", nullable = false, length = 64)
    private String equippedShipId = "NOVA-01";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UserPermanentUpgrade() {}

    public static UserPermanentUpgradeBuilder builder() {
        return new UserPermanentUpgradeBuilder();
    }

    public static class UserPermanentUpgradeBuilder {
        private Long userId;
        private User user;
        private Integer coinsBalance = 0;
        private Integer extraBaseHpLevel = 0;
        private Integer coinBonusLevel = 0;
        private Integer rerollCountLevel = 0;
        private Integer fastStartLevel = 0;
        private String equippedShipId = "NOVA-01";
        private LocalDateTime updatedAt;

        public UserPermanentUpgradeBuilder userId(Long userId) { this.userId = userId; return this; }
        public UserPermanentUpgradeBuilder user(User user) { this.user = user; return this; }
        public UserPermanentUpgradeBuilder coinsBalance(Integer coinsBalance) { this.coinsBalance = coinsBalance; return this; }
        public UserPermanentUpgradeBuilder extraBaseHpLevel(Integer extraBaseHpLevel) { this.extraBaseHpLevel = extraBaseHpLevel; return this; }
        public UserPermanentUpgradeBuilder coinBonusLevel(Integer coinBonusLevel) { this.coinBonusLevel = coinBonusLevel; return this; }
        public UserPermanentUpgradeBuilder rerollCountLevel(Integer rerollCountLevel) { this.rerollCountLevel = rerollCountLevel; return this; }
        public UserPermanentUpgradeBuilder fastStartLevel(Integer fastStartLevel) { this.fastStartLevel = fastStartLevel; return this; }
        public UserPermanentUpgradeBuilder equippedShipId(String equippedShipId) { this.equippedShipId = equippedShipId; return this; }
        public UserPermanentUpgradeBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public UserPermanentUpgrade build() {
            UserPermanentUpgrade u = new UserPermanentUpgrade();
            u.userId = this.userId;
            u.user = this.user;
            u.coinsBalance = this.coinsBalance != null ? this.coinsBalance : 0;
            u.extraBaseHpLevel = this.extraBaseHpLevel != null ? this.extraBaseHpLevel : 0;
            u.coinBonusLevel = this.coinBonusLevel != null ? this.coinBonusLevel : 0;
            u.rerollCountLevel = this.rerollCountLevel != null ? this.rerollCountLevel : 0;
            u.fastStartLevel = this.fastStartLevel != null ? this.fastStartLevel : 0;
            u.equippedShipId = this.equippedShipId != null ? this.equippedShipId : "NOVA-01";
            u.updatedAt = this.updatedAt;
            return u;
        }
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getCoinsBalance() { return coinsBalance; }
    public void setCoinsBalance(Integer coinsBalance) { this.coinsBalance = coinsBalance; }

    public Integer getExtraBaseHpLevel() { return extraBaseHpLevel; }
    public void setExtraBaseHpLevel(Integer extraBaseHpLevel) { this.extraBaseHpLevel = extraBaseHpLevel; }

    public Integer getCoinBonusLevel() { return coinBonusLevel; }
    public void setCoinBonusLevel(Integer coinBonusLevel) { this.coinBonusLevel = coinBonusLevel; }

    public Integer getRerollCountLevel() { return rerollCountLevel; }
    public void setRerollCountLevel(Integer rerollCountLevel) { this.rerollCountLevel = rerollCountLevel; }

    public Integer getFastStartLevel() { return fastStartLevel; }
    public void setFastStartLevel(Integer fastStartLevel) { this.fastStartLevel = fastStartLevel; }

    public String getEquippedShipId() { return equippedShipId; }
    public void setEquippedShipId(String equippedShipId) { this.equippedShipId = equippedShipId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
