package admin.jlas.game.modules.airdefense.model;

import admin.jlas.game.modules.auth.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_spaceships", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_ship", columnNames = {"user_id", "ship_id"})
})
public class UserSpaceship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ship_id", nullable = false)
    private AirDefenseSpaceship spaceship;

    @Column(name = "purchased_at", nullable = false)
    private LocalDateTime purchasedAt;

    public UserSpaceship() {}

    public static UserSpaceshipBuilder builder() {
        return new UserSpaceshipBuilder();
    }

    public static class UserSpaceshipBuilder {
        private Long id;
        private User user;
        private AirDefenseSpaceship spaceship;
        private LocalDateTime purchasedAt;

        public UserSpaceshipBuilder id(Long id) { this.id = id; return this; }
        public UserSpaceshipBuilder user(User user) { this.user = user; return this; }
        public UserSpaceshipBuilder spaceship(AirDefenseSpaceship spaceship) { this.spaceship = spaceship; return this; }
        public UserSpaceshipBuilder purchasedAt(LocalDateTime purchasedAt) { this.purchasedAt = purchasedAt; return this; }

        public UserSpaceship build() {
            UserSpaceship us = new UserSpaceship();
            us.id = this.id;
            us.user = this.user;
            us.spaceship = this.spaceship;
            us.purchasedAt = this.purchasedAt;
            return us;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AirDefenseSpaceship getSpaceship() { return spaceship; }
    public void setSpaceship(AirDefenseSpaceship spaceship) { this.spaceship = spaceship; }

    public LocalDateTime getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(LocalDateTime purchasedAt) { this.purchasedAt = purchasedAt; }
}
