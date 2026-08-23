package admin.jlas.game.modules.memory.runtime;

import admin.jlas.game.modules.arena.dto.ArenaEvent;
import admin.jlas.game.modules.memory.domain.MemorySession;
import admin.jlas.game.modules.memory.dto.MemoryEventType;
import admin.jlas.game.modules.memory.dto.MemoryStateView;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Gửi event của ván tới {@code /topic/memory/{sessionId}}. Mọi event đều kèm
 * snapshot mới nhất để client không phải tự dựng state (p2-memory §13).
 */
@Component
public class MemoryBroadcaster {

    private static final String SESSION_TOPIC = "/topic/memory/";
    private static final String USER_QUEUE = "/queue/memory";

    private final SimpMessagingTemplate messagingTemplate;

    public MemoryBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(MemorySession session, String type, MemoryStateView state) {
        ArenaEvent<Object> event =
                ArenaEvent.of(type, session.getSessionId(), state.stateVersion(), state);
        messagingTemplate.convertAndSend(SESSION_TOPIC + session.getSessionId(), event);
    }

    public void sendToUser(String username, String sessionId, String type, Object payload) {
        messagingTemplate.convertAndSendToUser(username, USER_QUEUE,
                ArenaEvent.of(type, sessionId, null, payload));
    }

    public void sendError(String username, String sessionId, String message) {
        sendToUser(username, sessionId, MemoryEventType.ERROR, Map.of("message", message));
    }
}
