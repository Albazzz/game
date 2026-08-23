package admin.jlas.game.modules.airdefense.ws;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.modules.airdefense.dto.SubmitAirDefenseAnswerRequest;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseBroadcaster;
import admin.jlas.game.modules.airdefense.service.AirDefenseMatchService;
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

@Controller
public class AirDefenseWsController {

    private static final Logger log = LoggerFactory.getLogger(AirDefenseWsController.class);
    private final AirDefenseMatchService matchService;
    private final ArenaRateLimiter rateLimiter;
    private final AirDefenseBroadcaster broadcaster;

    public AirDefenseWsController(AirDefenseMatchService matchService,
                                  ArenaRateLimiter rateLimiter,
                                  AirDefenseBroadcaster broadcaster) {
        this.matchService = matchService;
        this.rateLimiter = rateLimiter;
        this.broadcaster = broadcaster;
    }

    @MessageMapping("/air-defense/{sessionId}/answer")
    public void answer(@DestinationVariable String sessionId,
                       @Payload @Valid SubmitAirDefenseAnswerRequest request,
                       Principal principal) {
        UserPrincipal user = resolve(principal);
        if (user == null) return;
        if (!rateLimiter.tryAcquire(user.getUserId(), "answer")) {
            broadcaster.sendError(user.getUsername(), sessionId,
                    "Bạn gửi đáp án quá nhanh, thử lại sau");
            return;
        }
        try {
            matchService.submitAnswer(user, sessionId, request.aircraftId(),
                    request.answer(), request.commandId());
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Air Defense answer failed: {}", ex.getMessage());
            broadcaster.sendError(user.getUsername(), sessionId,
                    "Không thể xử lý đáp án");
        }
    }

    @MessageMapping("/air-defense/{sessionId}/state")
    public void state(@DestinationVariable String sessionId, Principal principal) {
        UserPrincipal user = resolve(principal);
        if (user == null) return;
        try {
            matchService.sendState(user, sessionId);
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        }
    }

    private UserPrincipal resolve(Principal principal) {
        if (principal instanceof Authentication auth
                && auth.getPrincipal() instanceof UserPrincipal user) return user;
        return null;
    }
}
