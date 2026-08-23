package admin.jlas.game.modules.airdefense.ws;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.modules.airdefense.domain.AirDefenseEventType;
import admin.jlas.game.modules.airdefense.dto.AirDefenseAnswerRequest;
import admin.jlas.game.modules.airdefense.dto.SelectAugmentRequest;
import admin.jlas.game.modules.airdefense.runtime.AirDefenseBroadcaster;
import admin.jlas.game.modules.airdefense.service.AirDefenseService;
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

    private final AirDefenseService airDefenseService;
    private final ArenaRateLimiter rateLimiter;
    private final AirDefenseBroadcaster broadcaster;

    public AirDefenseWsController(AirDefenseService airDefenseService,
                                  ArenaRateLimiter rateLimiter,
                                  AirDefenseBroadcaster broadcaster) {
        this.airDefenseService = airDefenseService;
        this.rateLimiter = rateLimiter;
        this.broadcaster = broadcaster;
    }

    @MessageMapping("/air-defense/{sessionId}/answer")
    public void submitAnswer(@DestinationVariable String sessionId,
                             @Payload @Valid AirDefenseAnswerRequest request,
                             Principal principal) {
        handle(principal, sessionId, "answer",
                user -> airDefenseService.processAnswer(user, sessionId, request));
    }

    @MessageMapping("/air-defense/{sessionId}/select-augment")
    public void selectAugment(@DestinationVariable String sessionId,
                              @Payload @Valid SelectAugmentRequest request,
                              Principal principal) {
        handle(principal, sessionId, "select-augment",
                user -> airDefenseService.selectAugment(user, sessionId, request));
    }

    @MessageMapping("/air-defense/{sessionId}/hyper-beam")
    public void fireHyperBeam(@DestinationVariable String sessionId, Principal principal) {
        handle(principal, sessionId, "hyper-beam",
                user -> airDefenseService.triggerHyperBeam(user, sessionId));
    }

    @MessageMapping("/air-defense/{sessionId}/planet-damage")
    public void reportPlanetDamage(@DestinationVariable String sessionId,
                                   @Payload java.util.Map<String, Integer> payload,
                                   Principal principal) {
        handle(principal, sessionId, "planet-damage",
                user -> {
                    int damage = payload.getOrDefault("damage", 15);
                    airDefenseService.applyPlanetDamage(sessionId, user.getUserId(), damage);
                });
    }

    @MessageMapping("/air-defense/{sessionId}/state")
    public void requestState(@DestinationVariable String sessionId, Principal principal) {
        UserPrincipal user = resolve(principal);
        if (user == null) return;
        try {
            broadcaster.sendToUser(user.getUsername(), sessionId,
                    AirDefenseEventType.SESSION_STATE, airDefenseService.getState(user, sessionId));
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        }
    }

    private interface Action {
        void run(UserPrincipal user);
    }

    private void handle(Principal principal, String sessionId, String limitKey, Action action) {
        UserPrincipal user = resolve(principal);
        if (user == null) return;

        if (!rateLimiter.tryAcquire(user.getUserId(), limitKey)) {
            broadcaster.sendError(user.getUsername(), sessionId, "Thao tác quá nhanh, thử lại sau");
            return;
        }

        try {
            action.run(user);
        } catch (ApiException ex) {
            broadcaster.sendError(user.getUsername(), sessionId, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Air Defense WS action {} failed: {}", limitKey, ex.getMessage());
            broadcaster.sendError(user.getUsername(), sessionId, "Có lỗi xảy ra, vui lòng thử lại");
        }
    }

    private UserPrincipal resolve(Principal principal) {
        if (principal instanceof Authentication auth && auth.getPrincipal() instanceof UserPrincipal user) {
            return user;
        }
        return null;
    }
}
