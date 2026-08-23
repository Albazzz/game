package admin.jlas.game.modules.arena.runtime;

import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;

import java.util.List;

/**
 * Cầu nối giữa lifecycle phòng (Phase 1) và engine của từng game (Phase 2+).
 * RoomService không biết chi tiết game nào; nó chỉ gọi launcher khớp
 * {@link #gameType()} khi countdown kết thúc.
 */
public interface GameSessionLauncher {

    GameType gameType();

    /**
     * Tạo session gameplay authoritative cho phòng.
     *
     * @return sessionId để client điều hướng, hoặc {@code null} nếu không tạo được
     *         (phòng vẫn vào IN_GAME nhưng client sẽ không có bàn chơi).
     */
    String launch(GameRoom room, RoomStateView snapshot, List<RoomPlayer> players, Long matchId);

    /**
     * Phòng đóng/huỷ giữa ván: engine dừng session tương ứng. Default no-op để game
     * chưa có engine (Phase 2B+) không phải implement.
     */
    default void abortByRoom(String roomId) {
    }
}
