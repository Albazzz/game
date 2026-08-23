package admin.jlas.game.modules.arena.support;

import admin.jlas.game.config.GameProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limit dạng fixed-window cho action WebSocket (p1.md §16).
 * Key = userId + ":" + action, cửa sổ 1 phút.
 */
@Component
public class ArenaRateLimiter {

    private record Window(long minuteStamp, AtomicInteger count) {
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final GameProperties gameProperties;
    private final Clock clock;

    public ArenaRateLimiter(GameProperties gameProperties, Clock clock) {
        this.gameProperties = gameProperties;
        this.clock = clock;
    }

    public boolean tryAcquire(long userId, String action) {
        int limit = limitFor(action);
        if (limit <= 0) {
            return true;
        }
        long minute = clock.millis() / 60_000L;
        String key = userId + ":" + action;

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || existing.minuteStamp() != minute) {
                return new Window(minute, new AtomicInteger(0));
            }
            return existing;
        });
        return window.count().incrementAndGet() <= limit;
    }

    /** Dọn window cũ, gọi từ scheduler của RoomRegistry sweep. */
    public void evictStale() {
        long minute = clock.millis() / 60_000L;
        windows.entrySet().removeIf(entry -> entry.getValue().minuteStamp() < minute - 1);
    }

    private int limitFor(String action) {
        GameProperties.RateLimit config = gameProperties.getArena().getRateLimit();
        return switch (action) {
            case "ready" -> config.getReadyPerMinute();
            case "settings" -> config.getSettingsPerMinute();
            case "start" -> config.getStartPerMinute();
            case "join" -> config.getJoinPerMinute();
            case "flip" -> config.getFlipPerMinute();
            case "answer" -> config.getAnswerPerMinute();
            default -> 0;
        };
    }
}
