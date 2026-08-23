package admin.jlas.game.modules.memory.runtime;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.memory.domain.MemorySession;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** Registry session in-memory, mirror {@code RoomRegistry} (rule.md §9). */
@Component
public class MemorySessionRegistry {

    private final Map<String, MemorySession> sessionsById = new ConcurrentHashMap<>();
    /** userId -> sessionId đang chơi, để reconnect và chặn chơi 2 ván cùng lúc. */
    private final Map<Long, String> sessionIdByUserId = new ConcurrentHashMap<>();

    private final GameProperties gameProperties;

    public MemorySessionRegistry(GameProperties gameProperties) {
        this.gameProperties = gameProperties;
    }

    public void register(MemorySession session) {
        if (sessionsById.size() >= gameProperties.getMemory().getMaxSessions()) {
            throw new ApiException(ErrorCode.TOO_MANY_REQUESTS,
                    "Server đang quá tải ván chơi, thử lại sau");
        }
        sessionsById.put(session.getSessionId(), session);
        session.playersByUserId().keySet()
                .forEach(userId -> sessionIdByUserId.put(userId, session.getSessionId()));
    }

    public Optional<MemorySession> findById(String sessionId) {
        return sessionId == null ? Optional.empty() : Optional.ofNullable(sessionsById.get(sessionId));
    }

    public MemorySession requireById(String sessionId) {
        return findById(sessionId).orElseThrow(() -> new ApiException(ErrorCode.SESSION_NOT_FOUND));
    }

    public Optional<String> currentSessionIdOf(long userId) {
        return Optional.ofNullable(sessionIdByUserId.get(userId));
    }

    public void remove(MemorySession session) {
        sessionsById.remove(session.getSessionId());
        session.playersByUserId().keySet()
                .forEach(userId -> sessionIdByUserId.remove(userId, session.getSessionId()));
    }

    public List<MemorySession> snapshotAll() {
        return new ArrayList<>(sessionsById.values());
    }

    public int sessionCount() {
        return sessionsById.size();
    }
}
