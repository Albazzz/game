package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.modules.airdefense.service.AirDefenseMatchService;
import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.runtime.GameSessionLauncher;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AirDefenseMatchLauncher implements GameSessionLauncher {

    private final AirDefenseMatchService matchService;

    public AirDefenseMatchLauncher(AirDefenseMatchService matchService) {
        this.matchService = matchService;
    }

    @Override
    public GameType gameType() {
        return GameType.CANNON_BATTLE;
    }

    @Override
    public String launch(GameRoom room, RoomStateView snapshot, List<RoomPlayer> players,
                         Long matchId) {
        return matchService.createForRoom(room.getRoomId(), matchId,
                room.getSettings(), players).getSessionId();
    }

    @Override
    public void abortByRoom(String roomId) {
        matchService.abortByRoom(roomId);
    }
}
