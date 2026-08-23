package admin.jlas.game.modules.arena.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "game_match_player",
        uniqueConstraints = @UniqueConstraint(name = "uk_match_player", columnNames = {"match_id", "user_id"}),
        indexes = @Index(name = "idx_match_player_user", columnList = "user_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMatchPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_player_id")
    private Long matchPlayerId;

    @Column(name = "match_id", nullable = false)
    private Long matchId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(name = "slot", nullable = false)
    private int slot;

    @Column(name = "team")
    private Integer team;

    @Column(name = "score", nullable = false)
    @Builder.Default
    private int score = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 16)
    @Builder.Default
    private PlayerResult result = PlayerResult.PENDING;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "disconnected", nullable = false)
    @Builder.Default
    private boolean disconnected = false;
}
