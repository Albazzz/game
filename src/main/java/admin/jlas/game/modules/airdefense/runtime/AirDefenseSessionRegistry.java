package admin.jlas.game.modules.airdefense.runtime;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AirDefenseSessionRegistry {

    private final Map<String, AirDefenseSession> sessions = new ConcurrentHashMap<>();
    private final Map<Long, String> sessionByUserId = new ConcurrentHashMap<>();

    public void register(AirDefenseSession session) {
        sessions.put(session.getSessionId(), session);
        session.playersByUserId().keySet()
                .forEach(userId -> sessionByUserId.put(userId, session.getSessionId()));
    }

    public Optional<AirDefenseSession> findById(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    public AirDefenseSession requireById(String sessionId) {
        return findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND));
    }

    public Optional<String> currentSessionIdOf(long userId) {
        return Optional.ofNullable(sessionByUserId.get(userId));
    }

    public List<AirDefenseSession> snapshotAll() {
        return List.copyOf(sessions.values());
    }

    public void remove(AirDefenseSession session) {
        sessions.remove(session.getSessionId(), session);
        session.playersByUserId().keySet()
                .forEach(userId -> sessionByUserId.remove(userId, session.getSessionId()));
    }
}
