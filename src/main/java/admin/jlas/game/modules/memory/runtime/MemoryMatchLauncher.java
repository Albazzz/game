package admin.jlas.game.modules.memory.runtime;

import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.runtime.GameSessionLauncher;
import admin.jlas.game.modules.memory.service.MemoryService;
import org.springframework.stereotype.Component;

import java.util.List;

/** Nối lifecycle phòng với engine Memory Match khi countdown kết thúc. */
@Component
public class MemoryMatchLauncher implements GameSessionLauncher {

    private final MemoryService memoryService;

    public MemoryMatchLauncher(MemoryService memoryService) {
        this.memoryService = memoryService;
    }

    @Override
    public GameType gameType() {
        return GameType.MEMORY_MATCH;
    }

    @Override
    public String launch(GameRoom room, RoomStateView snapshot, List<RoomPlayer> players,
                         Long matchId) {
        return memoryService
                .createForRoom(room.getRoomId(), matchId, room.getSettings(), players)
                .getSessionId();
    }

    @Override
    public void abortByRoom(String roomId) {
        memoryService.abortByRoom(roomId);
    }
}
