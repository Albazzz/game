package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.dto.AirDefenseAnswerRequest;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import admin.jlas.game.modules.airdefense.dto.CreateAirDefenseSoloRequest;
import admin.jlas.game.modules.airdefense.dto.SelectAugmentRequest;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AirDefenseMatchService {

    private final AirDefenseService airDefenseService;

    public AirDefenseMatchService(AirDefenseService airDefenseService) {
        this.airDefenseService = airDefenseService;
    }

    public AirDefenseSession createSoloSession(UserPrincipal principal, CreateAirDefenseSoloRequest req) {
        return airDefenseService.createSoloSession(principal, req);
    }

    public AirDefenseSession createForRoom(String roomId, Long matchId, GameSettings settings, List<RoomPlayer> players) {
        return airDefenseService.createForRoom(roomId, matchId, settings, players);
    }

    public AirDefenseStateView getState(UserPrincipal principal, String sessionId) {
        return airDefenseService.getState(principal, sessionId);
    }

    public void processAnswer(UserPrincipal principal, String sessionId, AirDefenseAnswerRequest req) {
        airDefenseService.processAnswer(principal, sessionId, req);
    }

    public void selectAugment(UserPrincipal principal, String sessionId, SelectAugmentRequest req) {
        airDefenseService.selectAugment(principal, sessionId, req);
    }

    public void triggerHyperBeam(UserPrincipal principal, String sessionId) {
        airDefenseService.triggerHyperBeam(principal, sessionId);
    }

    public void applyPlanetDamage(String sessionId, Long userId, int damageAmount) {
        airDefenseService.applyPlanetDamage(sessionId, userId, damageAmount);
    }

    public void abortByRoom(String roomId) {
        airDefenseService.abortByRoom(roomId);
    }

    public int sweepStaleSessions() {
        return airDefenseService.sweepStaleSessions();
    }

    public void markReconnected(Long userId) {
        airDefenseService.markReconnected(userId);
    }

    public void markDisconnected(Long userId) {
        airDefenseService.markDisconnected(userId);
    }
}
