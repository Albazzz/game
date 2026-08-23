package admin.jlas.game.modules.arena.ws;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.modules.arena.dto.request.ReadyRequest;
import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import admin.jlas.game.modules.arena.service.RoomService;
import admin.jlas.game.modules.arena.support.ArenaRateLimiter;
import admin.jlas.game.modules.auth.security.UserPrincipal;
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
 * Transport layer thuần: xác thực principal, rate limit, rồi uỷ quyền cho
 * {@link RoomService}. Không chứa domain rule (p1.md §9).
 */
@Controller
public class ArenaWsController {

    private static final Logger log = LoggerFactory.getLogger(ArenaWsController.class);

    private final RoomService roomService;
    private final ArenaRateLimiter rateLimiter;
    private final admin.jlas.game.modules.arena.runtime.ArenaBroadcaster broadcaster;

    public ArenaWsController(RoomService roomService,
                             ArenaRateLimiter rateLimiter,
                             admin.jlas.game.modules.arena.runtime.ArenaBroadcaster broadcaster) {
        this.roomService = roomService;
        this.rateLimiter = rateLimiter;
        this.broadcaster = broadcaster;
    }

    @MessageMapping("/arena/room/{roomId}/join")
    public void join(@DestinationVariable String roomId, Principal principal) {
        handle(principal, roomId, "join", user -> roomService.joinRoom(user, roomId));
    }

    @MessageMapping("/arena/room/{roomId}/ready")
    public void ready(@DestinationVariable String roomId,
                      @Payload @Valid ReadyRequest request,
                      Principal principal) {
        boolean ready = request == null || request.ready() == null || request.ready();
        handle(principal, roomId, "ready", user -> roomService.setReady(user, roomId, ready));
    }

    @MessageMapping("/arena/room/{roomId}/settings")
    public void updateSettings(@DestinationVariable String roomId,
                               @Payload @Valid UpdateSettingsRequest request,
                               Principal principal) {
        handle(principal, roomId, "settings", user -> roomService.updateSettings(user, roomId, request));
    }

    @MessageMapping("/arena/room/{roomId}/start")
    public void start(@DestinationVariable String roomId, Principal principal) {
        handle(principal, roomId, "start", user -> roomService.requestStart(user, roomId));
    }

    @MessageMapping("/arena/room/{roomId}/leave")
    public void leave(@DestinationVariable String roomId, Principal principal) {
        handle(principal, roomId, "join", user -> {
            roomService.leaveRoom(user.getUserId());
            return null;
        });
    }

    @MessageMapping("/arena/room/{roomId}/state")
    public void requestState(@DestinationVariable String roomId, Principal principal) {
        UserPrincipal user = resolve(principal);
        if (user == null) {
            return;
        }
        try {
            var state = roomService.getRoomState(user, roomId);
            broadcaster.sendToUser(user.getUsername(), roomId,
                    admin.jlas.game.modules.arena.dto.ArenaEventType.ROOM_STATE, state);
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), roomId, ex.getMessage());
        }
    }

    private interface Action {
        Object run(UserPrincipal user);
    }

    private void handle(Principal principal, String roomId, String limitKey, Action action) {
        UserPrincipal user = resolve(principal);
        if (user == null) {
            return;
        }
        if (!rateLimiter.tryAcquire(user.getUserId(), limitKey)) {
            broadcaster.sendError(user.getUsername(), roomId, "Bạn thao tác quá nhanh, thử lại sau");
            return;
        }
        try {
            action.run(user);
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), roomId, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Arena WS action {} failed: {}", limitKey, ex.getMessage());
            broadcaster.sendError(user.getUsername(), roomId, "Có lỗi xảy ra, vui lòng thử lại");
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
