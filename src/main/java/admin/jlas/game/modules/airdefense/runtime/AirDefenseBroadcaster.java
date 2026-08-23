package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.modules.airdefense.domain.AirDefenseEventType;
import admin.jlas.game.modules.arena.dto.ArenaEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AirDefenseBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(AirDefenseBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;

    public AirDefenseBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(String sessionId, AirDefenseEventType type, Object payload) {
        String destination = "/topic/air-defense/" + sessionId;
        try {
            messagingTemplate.convertAndSend(destination, Map.of(
                    "type", type.name(),
                    "payload", payload,
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception ex) {
            log.warn("Lỗi broadcast Air Defense event {} tới session {}: {}", type, sessionId, ex.getMessage());
        }
    }

    public void sendToUser(String username, String sessionId, AirDefenseEventType type, Object payload) {
        String destination = "/topic/air-defense/" + sessionId;
        try {
            messagingTemplate.convertAndSendToUser(username, destination, Map.of(
                    "type", type.name(),
                    "payload", payload,
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception ex) {
            log.warn("Lỗi gửi Air Defense event {} tới user {}: {}", type, username, ex.getMessage());
        }
    }

    public void sendError(String username, String sessionId, String errorMessage) {
        sendToUser(username, sessionId, AirDefenseEventType.ERROR, Map.of("message", errorMessage));
    }
}
