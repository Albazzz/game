package admin.jlas.game.modules.arena.dto.response;

import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomStatus;
import admin.jlas.game.modules.arena.domain.RoomVisibility;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/** Snapshot phòng gửi cho client — chỉ field cần cho UI, không phải entity DB. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomStateView(
        String roomId,
        String roomCode,
        GameType gameType,
        String gameDisplayName,
        RoomStatus status,
        RoomVisibility visibility,
        int maxPlayers,
        int minPlayers,
        long hostUserId,
        long stateVersion,
        GameSettingsView settings,
        List<RoomPlayerView> players,
        boolean canStart,
        String startBlockedReason,
        Instant countdownStartAt,
        Instant countdownEndAt,
        Integer countdownSeconds,
        String sessionId,
        Instant serverTime,
        Instant createdAt) {
}
