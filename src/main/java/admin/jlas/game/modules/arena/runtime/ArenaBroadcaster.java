package admin.jlas.game.modules.arena.runtime;

import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.dto.ArenaEvent;
import admin.jlas.game.modules.arena.dto.ArenaEventType;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.mapper.ArenaViewMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Gửi event tới topic của phòng và queue riêng của user. */
@Component
public class ArenaBroadcaster {

    private static final String ROOM_TOPIC = "/topic/arena/room/";
    private static final String USER_QUEUE = "/queue/arena";

    private final SimpMessagingTemplate messagingTemplate;
    private final ArenaViewMapper viewMapper;

    public ArenaBroadcaster(SimpMessagingTemplate messagingTemplate, ArenaViewMapper viewMapper) {
        this.messagingTemplate = messagingTemplate;
        this.viewMapper = viewMapper;
    }

    public void broadcast(GameRoom room, String type, Object payload) {
        ArenaEvent<Object> event = ArenaEvent.of(type, room.getRoomId(), room.getStateVersion(), payload);
        messagingTemplate.convertAndSend(ROOM_TOPIC + room.getRoomId(), event);
    }

    public void broadcastState(GameRoom room, String type) {
        RoomStateView state = room.withLock(() -> viewMapper.toRoomState(room));
        broadcast(room, type, state);
    }

    public void broadcastStateSnapshot(GameRoom room, String type, RoomStateView state) {
        ArenaEvent<Object> event = ArenaEvent.of(type, room.getRoomId(), state.stateVersion(), state);
        messagingTemplate.convertAndSend(ROOM_TOPIC + room.getRoomId(), event);
    }

    public void sendToUser(String username, String roomId, String type, Object payload) {
        ArenaEvent<Object> event = ArenaEvent.of(type, roomId, null, payload);
        messagingTemplate.convertAndSendToUser(username, USER_QUEUE, event);
    }

    public void sendError(String username, String roomId, String message) {
        sendToUser(username, roomId, ArenaEventType.ROOM_ERROR, Map.of("message", message));
    }
}
