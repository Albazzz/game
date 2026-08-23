package admin.jlas.game.modules.arena.model;

import admin.jlas.game.modules.arena.domain.GameType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Bản ghi trận đấu (p1.md §12). Chỉ ghi khi trận thật sự bắt đầu. */
@Entity
@Table(name = "game_match", indexes = {
        @Index(name = "idx_game_match_room_code", columnList = "room_code"),
        @Index(name = "idx_game_match_started_at", columnList = "started_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "room_id", nullable = false, length = 64)
    private String roomId;

    @Column(name = "room_code", nullable = false, length = 16)
    private String roomCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false, length = 32)
    private GameType gameType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private MatchStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "winner_user_id")
    private Long winnerUserId;

    @Column(name = "winner_team")
    private Integer winnerTeam;

    /** Snapshot settings dạng JSON — tránh join khi xem lại lịch sử. */
    @Lob
    @Column(name = "settings_snapshot", columnDefinition = "TEXT")
    private String settingsSnapshot;
}
