package admin.jlas.game.modules.arena.mapper;

import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.GameCatalogItem;
import admin.jlas.game.modules.arena.dto.response.GameSettingsView;
import admin.jlas.game.modules.arena.dto.response.LobbyRoomView;
import admin.jlas.game.modules.arena.dto.response.RoomPlayerView;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Domain -> view. Chỉ expose field an toàn, không serialize entity/domain thô. */
@Component
public class ArenaViewMapper {

    private final Clock clock;

    public ArenaViewMapper(Clock clock) {
        this.clock = clock;
    }

    public RoomPlayerView toPlayerView(GameRoom room, RoomPlayer player) {
        return new RoomPlayerView(
                player.getPlayerId(),
                player.getUserId(),
                player.getDisplayName(),
                player.getAvatar(),
                player.isReady(),
                player.isConnected(),
                player.getTeam(),
                player.getSlot(),
                room.isHost(player.getUserId()));
    }

    public GameSettingsView toSettingsView(GameSettings settings) {
        return new GameSettingsView(
                settings.questionLevel(),
                settings.questionSource(),
                settings.answerMode(),
                settings.questionCount(),
                settings.secondsPerQuestion(),
                settings.extra());
    }

    /** Gọi khi đang giữ lock của room để snapshot nhất quán. */
    public RoomStateView toRoomState(GameRoom room) {
        GameRuleMetadata metadata = GameRuleMetadata.of(room.getGameType());
        List<RoomPlayerView> playerViews = new ArrayList<>();
        for (RoomPlayer player : room.orderedPlayers()) {
            playerViews.add(toPlayerView(room, player));
        }
        Integer countdownSeconds = null;
        if (room.getCountdownStartAt() != null && room.getCountdownEndAt() != null) {
            countdownSeconds = (int) Duration.between(room.getCountdownStartAt(), room.getCountdownEndAt())
                    .toSeconds();
        }
        return new RoomStateView(
                room.getRoomId(),
                room.getRoomCode(),
                room.getGameType(),
                metadata.displayName(),
                room.getStatus(),
                room.getVisibility(),
                room.getMaxPlayers(),
                metadata.minPlayers(),
                room.getHostUserId(),
                room.getStateVersion(),
                toSettingsView(room.getSettings()),
                playerViews,
                room.canStart(),
                room.startBlockedReason(),
                room.getCountdownStartAt(),
                room.getCountdownEndAt(),
                countdownSeconds,
                room.getCurrentSessionId(),
                Instant.now(clock),
                room.getCreatedAt());
    }

    public LobbyRoomView toLobbyView(GameRoom room) {
        GameRuleMetadata metadata = GameRuleMetadata.of(room.getGameType());
        String hostName = room.findPlayer(room.getHostUserId())
                .map(RoomPlayer::getDisplayName)
                .orElse("—");
        return new LobbyRoomView(
                room.getRoomId(),
                room.getRoomCode(),
                room.getGameType(),
                metadata.displayName(),
                room.getStatus(),
                hostName,
                room.playerCount(),
                room.getMaxPlayers(),
                room.getCreatedAt());
    }

    public GameCatalogItem toCatalogItem(GameRuleMetadata metadata) {
        return new GameCatalogItem(
                metadata.gameType(),
                metadata.displayName(),
                metadata.tagline(),
                metadata.description(),
                metadata.minPlayers(),
                metadata.maxPlayers(),
                metadata.soloSupported(),
                metadata.teamBased(),
                metadata.implemented(),
                metadata.difficultyTag(),
                metadata.modeLabel(),
                List.copyOf(metadata.supportedAnswerModes()),
                metadata.defaultAnswerMode());
    }
}
