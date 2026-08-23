package admin.jlas.game.modules.airdefense.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.dto.AirDefenseShopView;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import admin.jlas.game.modules.airdefense.dto.BuyShipRequest;
import admin.jlas.game.modules.airdefense.dto.CreateAirDefenseSoloRequest;
import admin.jlas.game.modules.airdefense.dto.UpgradeTalentRequest;
import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import admin.jlas.game.modules.airdefense.repository.AirDefenseResultRepository;
import admin.jlas.game.modules.airdefense.service.AirDefenseService;
import admin.jlas.game.modules.airdefense.service.AirDefenseShopService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/air-defense")
public class AirDefenseRestController {

    private final AirDefenseService airDefenseService;
    private final AirDefenseShopService shopService;
    private final AirDefenseResultRepository resultRepository;

    public AirDefenseRestController(AirDefenseService airDefenseService,
                                    AirDefenseShopService shopService,
                                    AirDefenseResultRepository resultRepository) {
        this.airDefenseService = airDefenseService;
        this.shopService = shopService;
        this.resultRepository = resultRepository;
    }

    @PostMapping("/start-solo")
    public ResponseEntity<ApiResponse<Map<String, String>>> startSolo(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody(required = false) CreateAirDefenseSoloRequest request) {
        if (request == null) {
            request = new CreateAirDefenseSoloRequest(null, null, null);
        }
        AirDefenseSession session = airDefenseService.createSoloSession(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Khởi tạo trận solo thành công", Map.of(
                "sessionId", session.getSessionId(),
                "redirectUrl", "/games/air-defense/" + session.getSessionId()
        )));
    }

    @GetMapping("/session/{sessionId}/state")
    public ResponseEntity<ApiResponse<AirDefenseStateView>> getSessionState(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok("Lấy trạng thái thành công", airDefenseService.getState(user, sessionId)));
    }

    @GetMapping("/shop/ships")
    public ResponseEntity<ApiResponse<AirDefenseShopView>> getShopView(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin shop thành công", shopService.getShopView(user)));
    }

    @PostMapping("/shop/buy-ship/{shipId}")
    public ResponseEntity<ApiResponse<AirDefenseShopView>> buyShip(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String shipId) {
        shopService.buyShip(user, shipId);
        return ResponseEntity.ok(ApiResponse.ok("Mở khóa tàu chiến thành công", shopService.getShopView(user)));
    }

    @PostMapping("/shop/equip-ship/{shipId}")
    public ResponseEntity<ApiResponse<AirDefenseShopView>> equipShip(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String shipId) {
        shopService.equipShip(user, shipId);
        return ResponseEntity.ok(ApiResponse.ok("Trang bị tàu chiến thành công", shopService.getShopView(user)));
    }

    @PostMapping("/shop/upgrade-talent")
    public ResponseEntity<ApiResponse<AirDefenseShopView>> upgradeTalent(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody UpgradeTalentRequest request) {
        shopService.upgradeTalent(user, request.talentType());
        return ResponseEntity.ok(ApiResponse.ok("Nâng cấp Talent thành công", shopService.getShopView(user)));
    }

    @GetMapping("/leaderboard/endless")
    public ResponseEntity<ApiResponse<List<AirDefenseResult>>> getEndlessLeaderboard() {
        List<AirDefenseResult> top = resultRepository.findTopEndlessScores(PageRequest.of(0, 20));
        return ResponseEntity.ok(ApiResponse.ok("Lấy BXH Endless thành công", top));
    }

    @GetMapping("/leaderboard/ranked")
    public ResponseEntity<ApiResponse<List<AirDefenseResult>>> getRankedLeaderboard() {
        List<AirDefenseResult> top = resultRepository.findTopRankedWinners(PageRequest.of(0, 20));
        return ResponseEntity.ok(ApiResponse.ok("Lấy BXH Ranked thành công", top));
    }
}
