package admin.jlas.game.modules.memory.ws;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.modules.arena.support.ArenaRateLimiter;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.memory.dto.FlipCardRequest;
import admin.jlas.game.modules.memory.dto.MemoryEventType;
import admin.jlas.game.modules.memory.runtime.MemoryBroadcaster;
import admin.jlas.game.modules.memory.service.MemoryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Transport layer cho Memory Match: xác thực principal, rate limit, uỷ quyền cho
 * {@link MemoryService}. Không chứa luật chơi.
 */
@Controller
public class MemoryWsController {

    private static final Logger log = LoggerFactory.getLogger(MemoryWsController.class);

    private final MemoryService memoryService;
    private final ArenaRateLimiter rateLimiter;
    private final MemoryBroadcaster broadcaster;

    public MemoryWsController(MemoryService memoryService,
                              ArenaRateLimiter rateLimiter,
                              MemoryBroadcaster broadcaster) {
        this.memoryService = memoryService;
        this.rateLimiter = rateLimiter;
        this.broadcaster = broadcaster;
    }

    @MessageMapping("/memory/{sessionId}/flip")
    public void flip(@DestinationVariable String sessionId,
                     @Payload @Valid FlipCardRequest request,
                     Principal principal) {
        handle(principal, sessionId, "flip",
                user -> memoryService.flip(user, sessionId, request.cardInstanceId()));
    }

    /** Client gọi khi vào bàn hoặc reconnect để lấy snapshot đầy đủ. */
    @MessageMapping("/memory/{sessionId}/state")
    public void requestState(@DestinationVariable String sessionId, Principal principal) {
        UserPrincipal user = resolve(principal);
        if (user == null) {
            return;
        }
        try {
            broadcaster.sendToUser(user.getUsername(), sessionId,
                    MemoryEventType.SESSION_STATE, memoryService.getState(user, sessionId));
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        }
    }

    private interface Action {
        void run(UserPrincipal user);
    }

    private void handle(Principal principal, String sessionId, String limitKey, Action action) {
        UserPrincipal user = resolve(principal);
        if (user == null) {
            return;
        }
        if (!rateLimiter.tryAcquire(user.getUserId(), limitKey)) {
            broadcaster.sendError(user.getUsername(), sessionId,
                    "Bạn thao tác quá nhanh, thử lại sau");
            return;
        }
        try {
            action.run(user);
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Memory WS action {} failed: {}", limitKey, ex.getMessage());
            broadcaster.sendError(user.getUsername(), sessionId,
                    "Có lỗi xảy ra, vui lòng thử lại");
        }
    }

    private UserPrincipal resolve(Principal principal) {
        if (principal instanceof Authentication auth
                && auth.getPrincipal() instanceof UserPrincipal user) {
            return user;
        }
        return null;
    }
}
