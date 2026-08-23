package admin.jlas.game.modules.arena.runtime;

/** Tín hiệu nội bộ để engine gameplay trả phòng về trạng thái chờ tái đấu. */
public record ArenaGameFinishedEvent(String roomId, String sessionId) {
}
