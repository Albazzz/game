package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.modules.airdefense.domain.AirDefensePlayerState;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.dto.AirDefenseActionMeta;
import admin.jlas.game.modules.airdefense.dto.AirDefenseEventPayload;
import admin.jlas.game.modules.airdefense.dto.AirDefenseEventType;
import admin.jlas.game.modules.airdefense.mapper.AirDefenseViewMapper;
import admin.jlas.game.modules.arena.dto.ArenaEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Mọi snapshot đi qua private user destination vì câu hỏi hiện tại là dữ liệu riêng.
 * Đối thủ chỉ nhận aircraft timing + chỉ số công khai, không nhận questionText.
 */
@Component
public class AirDefenseBroadcaster {

    public static final String USER_QUEUE = "/queue/air-defense";
    private final SimpMessagingTemplate messagingTemplate;
    private final AirDefenseViewMapper viewMapper;

    public AirDefenseBroadcaster(SimpMessagingTemplate messagingTemplate,
                                 AirDefenseViewMapper viewMapper) {
        this.messagingTemplate = messagingTemplate;
        this.viewMapper = viewMapper;
    }

    public void broadcast(AirDefenseSession session, String type, AirDefenseActionMeta action) {
        for (AirDefensePlayerState player : session.orderedPlayers()) {
            var state = viewMapper.toState(session, player.getUserId());
            messagingTemplate.convertAndSendToUser(player.getUsername(), USER_QUEUE,
                    ArenaEvent.of(type, session.getSessionId(), state.stateVersion(),
                            new AirDefenseEventPayload(state, action)));
        }
    }

    public void sendState(AirDefenseSession session, AirDefensePlayerState player) {
        var state = viewMapper.toState(session, player.getUserId());
        messagingTemplate.convertAndSendToUser(player.getUsername(), USER_QUEUE,
                ArenaEvent.of(AirDefenseEventType.SESSION_STATE, session.getSessionId(),
                        state.stateVersion(), new AirDefenseEventPayload(state, null)));
    }

    public void sendError(String username, String sessionId, String message) {
        messagingTemplate.convertAndSendToUser(username, USER_QUEUE,
                ArenaEvent.of(AirDefenseEventType.ERROR, sessionId, null,
                        Map.of("message", message)));
    }
}
