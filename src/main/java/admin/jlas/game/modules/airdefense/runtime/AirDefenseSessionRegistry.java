package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AirDefenseSessionRegistry {

    private final Map<String, AirDefenseSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> roomToSession = new ConcurrentHashMap<>();

    public void register(AirDefenseSession session) {
        sessions.put(session.getSessionId(), session);
        if (session.getRoomId() != null) {
            roomToSession.put(session.getRoomId(), session.getSessionId());
        }
    }

    public Optional<AirDefenseSession> findById(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    public Optional<AirDefenseSession> findByRoomId(String roomId) {
        String sessionId = roomToSession.get(roomId);
        return sessionId == null ? Optional.empty() : findById(sessionId);
    }

    public void remove(String sessionId) {
        AirDefenseSession removed = sessions.remove(sessionId);
        if (removed != null && removed.getRoomId() != null) {
            roomToSession.remove(removed.getRoomId());
        }
    }

    public Collection<AirDefenseSession> all() {
        return sessions.values();
    }
}
