package admin.jlas.game.modules.airdefense.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.dto.AirDefenseStateView;
import admin.jlas.game.modules.airdefense.dto.CreateAirDefenseSessionRequest;
import admin.jlas.game.modules.airdefense.service.AirDefenseMatchService;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.service.GameSettingsValidator;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/air-defense")
public class AirDefenseController {

    private final AirDefenseMatchService matchService;
    private final GameSettingsValidator settingsValidator;

    public AirDefenseController(AirDefenseMatchService matchService,
                                GameSettingsValidator settingsValidator) {
        this.matchService = matchService;
        this.settingsValidator = settingsValidator;
    }

    @PostMapping("/sessions")
    public ApiResponse<AirDefenseStateView> createSolo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody(required = false) CreateAirDefenseSessionRequest request) {
        GameSettings settings = GameSettings.defaultsFor(GameType.CANNON_BATTLE);
        if (request != null && request.settings() != null) {
            settings = settingsValidator.validateAndMerge(
                    GameRuleMetadata.of(GameType.CANNON_BATTLE), settings, request.settings());
        }
        AirDefenseSession session = matchService.createSolo(principal, settings);
        return ApiResponse.ok("Đã tạo ván Air Defense",
                matchService.getState(principal, session.getSessionId()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ApiResponse<AirDefenseStateView> state(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String sessionId) {
        return ApiResponse.ok("Trạng thái Air Defense",
                matchService.getState(principal, sessionId));
    }

    @PostMapping("/sessions/{sessionId}/pause")
    public ApiResponse<AirDefenseStateView> pause(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String sessionId) {
        return ApiResponse.ok("Đã tạm dừng",
                matchService.setPaused(principal, sessionId, true));
    }

    @PostMapping("/sessions/{sessionId}/resume")
    public ApiResponse<AirDefenseStateView> resume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String sessionId) {
        return ApiResponse.ok("Đã tiếp tục",
                matchService.setPaused(principal, sessionId, false));
    }
}
