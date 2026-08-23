package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.modules.airdefense.service.AirDefenseService;
import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.runtime.GameSessionLauncher;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AirDefenseMatchLauncher implements GameSessionLauncher {

    private final AirDefenseService airDefenseService;

    public AirDefenseMatchLauncher(AirDefenseService airDefenseService) {
        this.airDefenseService = airDefenseService;
    }

    @Override
    public GameType gameType() {
        return GameType.CANNON_BATTLE;
    }

    @Override
    public String launch(GameRoom room, RoomStateView snapshot, List<RoomPlayer> players, Long matchId) {
        return airDefenseService
                .createForRoom(room.getRoomId(), matchId, room.getSettings(), players)
                .getSessionId();
    }

    @Override
    public void abortByRoom(String roomId) {
        airDefenseService.abortByRoom(roomId);
    }
}
