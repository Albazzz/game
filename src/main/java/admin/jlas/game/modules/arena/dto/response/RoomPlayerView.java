package admin.jlas.game.modules.arena.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/** View an toàn của player — không bao giờ chứa email/hash (p1.md §4). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomPlayerView(
        String playerId,
        Long userId,
        String displayName,
        String avatar,
        boolean ready,
        boolean connected,
        Integer team,
        int slot,
        boolean isHost) {
}
