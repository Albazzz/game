package admin.jlas.game.modules.arena.dto.response;

import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomStatus;

import java.time.Instant;

/** Item trong danh sách lobby (chỉ phòng PUBLIC đang WAITING). */
public record LobbyRoomView(
        String roomId,
        String roomCode,
        GameType gameType,
        String gameDisplayName,
        RoomStatus status,
        String hostDisplayName,
        int playerCount,
        int maxPlayers,
        Instant createdAt) {
}
