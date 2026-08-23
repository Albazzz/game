package admin.jlas.game.modules.arena.runtime;

import admin.jlas.game.modules.arena.service.RoomService;
import admin.jlas.game.modules.arena.support.ArenaRateLimiter;
import admin.jlas.game.modules.airdefense.service.AirDefenseMatchService;
import admin.jlas.game.modules.memory.service.MemoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Dọn phòng hết hạn + window rate limit cũ + session gameplay bỏ dở. */
@Component
public class ArenaSweeper {

    private static final Logger log = LoggerFactory.getLogger(ArenaSweeper.class);

    private final RoomService roomService;
    private final ArenaRateLimiter rateLimiter;
    private final MemoryService memoryService;
    private final AirDefenseMatchService airDefenseMatchService;

    public ArenaSweeper(RoomService roomService, ArenaRateLimiter rateLimiter,
                        MemoryService memoryService,
                        AirDefenseMatchService airDefenseMatchService) {
        this.roomService = roomService;
        this.rateLimiter = rateLimiter;
        this.memoryService = memoryService;
        this.airDefenseMatchService = airDefenseMatchService;
    }

    @Scheduled(fixedDelayString = "${game.arena.sweep-interval-ms:15000}")
    public void sweep() {
        try {
            roomService.sweepExpiredRooms();
            rateLimiter.evictStale();
            int staleSessions = memoryService.sweepStaleSessions();
            int staleAirSessions = airDefenseMatchService.sweepStaleSessions();
            if (staleSessions > 0) {
                log.debug("Dọn {} session Memory bỏ dở", staleSessions);
            }
            if (staleAirSessions > 0) {
                log.debug("Dọn {} session Air Defense bỏ dở", staleAirSessions);
            }
        } catch (Exception ex) {
            log.warn("Arena sweep failed: {}", ex.getMessage());
        }
    }
}
