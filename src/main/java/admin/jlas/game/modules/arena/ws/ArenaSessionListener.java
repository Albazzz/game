package admin.jlas.game.modules.arena.ws;

import admin.jlas.game.modules.arena.service.RoomService;
import admin.jlas.game.modules.airdefense.service.AirDefenseMatchService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.memory.service.MemoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

/** Map sự kiện WS sang domain: bind session khi subscribe, grace khi disconnect. */
@Component
public class ArenaSessionListener {

    private static final Logger log = LoggerFactory.getLogger(ArenaSessionListener.class);
    private static final String ROOM_TOPIC_PREFIX = "/topic/arena/room/";
    private static final String MEMORY_TOPIC_PREFIX = "/topic/memory/";
    private static final String AIR_DEFENSE_USER_QUEUE = "/user/queue/air-defense";

    private final RoomService roomService;
    private final MemoryService memoryService;
    private final AirDefenseMatchService airDefenseMatchService;

    public ArenaSessionListener(RoomService roomService, MemoryService memoryService,
                                AirDefenseMatchService airDefenseMatchService) {
        this.roomService = roomService;
        this.memoryService = memoryService;
        this.airDefenseMatchService = airDefenseMatchService;
    }

    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        UserPrincipal principal = principalOf(accessor);
        if (principal == null || destination == null) {
            return;
        }
        if (destination.startsWith(ROOM_TOPIC_PREFIX)) {
            String roomId = destination.substring(ROOM_TOPIC_PREFIX.length());
            roomService.bindSession(principal.getUserId(), roomId, accessor.getSessionId());
        } else if (destination.startsWith(MEMORY_TOPIC_PREFIX)) {
            // Vào lại bàn Memory sau khi mất kết nối: bỏ cờ offline.
            memoryService.markReconnected(principal.getUserId());
        } else if (AIR_DEFENSE_USER_QUEUE.equals(destination)) {
            airDefenseMatchService.markReconnected(principal.getUserId());
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        UserPrincipal principal = principalOf(accessor);
        if (principal == null) {
            return;
        }
        log.debug("WS disconnect user={} session={}", principal.getUserId(), event.getSessionId());
        roomService.handleDisconnect(principal.getUserId(), event.getSessionId());
        memoryService.markDisconnected(principal.getUserId());
        airDefenseMatchService.markDisconnected(principal.getUserId());
    }

    private UserPrincipal principalOf(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication auth
                && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }
}
