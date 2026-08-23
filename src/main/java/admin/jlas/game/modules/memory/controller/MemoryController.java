package admin.jlas.game.modules.memory.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.service.GameSettingsValidator;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.memory.domain.MemorySession;
import admin.jlas.game.modules.memory.dto.CreateMemorySessionRequest;
import admin.jlas.game.modules.memory.dto.MemoryStateView;
import admin.jlas.game.modules.memory.service.MemoryService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST cho Memory Match: tạo ván solo, đọc snapshot, pause/resume. Lật thẻ đi qua
 * WebSocket ({@code /app/memory/{sessionId}/flip}) để phản hồi realtime.
 * Không chứa luật chơi — mọi phán quyết ở {@link MemoryService}.
 */
@RestController
@RequestMapping("/api/memory")
public class MemoryController {

    private final MemoryService memoryService;
    private final GameSettingsValidator settingsValidator;

    public MemoryController(MemoryService memoryService,
                            GameSettingsValidator settingsValidator) {
        this.memoryService = memoryService;
        this.settingsValidator = settingsValidator;
    }

    @PostMapping("/sessions")
    public ApiResponse<MemoryStateView> createSolo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody(required = false) CreateMemorySessionRequest request) {
        GameSettings settings = GameSettings.defaultsFor(GameType.MEMORY_MATCH);
        if (request != null && request.settings() != null) {
            settings = settingsValidator.validateAndMerge(
                    GameRuleMetadata.of(GameType.MEMORY_MATCH), settings, request.settings());
        }
        MemorySession session = memoryService.createSolo(principal, settings);
        return ApiResponse.ok("Đã tạo ván Memory Match",
                memoryService.getState(principal, session.getSessionId()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ApiResponse<MemoryStateView> state(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable String sessionId) {
        return ApiResponse.ok("Trạng thái ván", memoryService.getState(principal, sessionId));
    }

    @PostMapping("/sessions/{sessionId}/pause")
    public ApiResponse<MemoryStateView> pause(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable String sessionId) {
        return ApiResponse.ok("Đã tạm dừng",
                memoryService.setPaused(principal, sessionId, true));
    }

    @PostMapping("/sessions/{sessionId}/resume")
    public ApiResponse<MemoryStateView> resume(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable String sessionId) {
        return ApiResponse.ok("Đã tiếp tục",
                memoryService.setPaused(principal, sessionId, false));
    }
}
