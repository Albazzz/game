package admin.jlas.game.modules.arena.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.dto.request.CreateRoomRequest;
import admin.jlas.game.modules.arena.dto.request.JoinByCodeRequest;
import admin.jlas.game.modules.arena.dto.request.ReadyRequest;
import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import admin.jlas.game.modules.arena.dto.response.GameCatalogItem;
import admin.jlas.game.modules.arena.dto.response.LobbyRoomView;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.mapper.ArenaViewMapper;
import admin.jlas.game.modules.arena.service.RoomService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** REST cho lobby/room. Realtime dùng WebSocket; REST là entry point + fallback. */
@RestController
@RequestMapping("/api/games")
public class ArenaRestController {

    private final RoomService roomService;
    private final ArenaViewMapper viewMapper;

    public ArenaRestController(RoomService roomService, ArenaViewMapper viewMapper) {
        this.roomService = roomService;
        this.viewMapper = viewMapper;
    }

    @GetMapping("/catalog")
    public ApiResponse<List<GameCatalogItem>> catalog() {
        List<GameCatalogItem> items = GameRuleMetadata.all().stream()
                .map(viewMapper::toCatalogItem)
                .toList();
        return ApiResponse.ok("Danh sách game", items);
    }

    @GetMapping("/lobby/rooms")
    public ApiResponse<List<LobbyRoomView>> publicRooms() {
        return ApiResponse.ok("Phòng công khai", roomService.listPublicRooms());
    }

    @GetMapping("/lobby/stats")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.ok("Thống kê Arena", Map.of(
                "onlinePlayers", roomService.onlinePlayerCount(),
                "activeRooms", roomService.activeRoomCount()));
    }

    @PostMapping("/rooms")
    public ApiResponse<RoomStateView> createRoom(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody CreateRoomRequest request) {
        return ApiResponse.ok("Đã tạo phòng", roomService.createRoom(principal, request));
    }

    @PostMapping("/rooms/join-by-code")
    public ApiResponse<RoomStateView> joinByCode(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody JoinByCodeRequest request) {
        return ApiResponse.ok("Đã vào phòng", roomService.joinByCode(principal, request.roomCode()));
    }

    @PostMapping("/rooms/{roomId}/join")
    public ApiResponse<RoomStateView> join(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable String roomId) {
        return ApiResponse.ok("Đã vào phòng", roomService.joinRoom(principal, roomId));
    }

    @GetMapping("/rooms/{roomId}")
    public ApiResponse<RoomStateView> state(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String roomId) {
        return ApiResponse.ok("Trạng thái phòng", roomService.getRoomState(principal, roomId));
    }

    @PostMapping("/rooms/{roomId}/ready")
    public ApiResponse<RoomStateView> ready(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable String roomId,
                                            @RequestBody(required = false) ReadyRequest request) {
        boolean ready = request == null || request.ready() == null || request.ready();
        return ApiResponse.ok("Đã cập nhật", roomService.setReady(principal, roomId, ready));
    }

    @PatchMapping("/rooms/{roomId}/settings")
    public ApiResponse<RoomStateView> updateSettings(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable String roomId,
                                                     @Valid @RequestBody UpdateSettingsRequest request) {
        return ApiResponse.ok("Đã cập nhật cấu hình",
                roomService.updateSettings(principal, roomId, request));
    }

    @PostMapping("/rooms/{roomId}/start")
    public ApiResponse<RoomStateView> start(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable String roomId) {
        return ApiResponse.ok("Bắt đầu đếm ngược", roomService.requestStart(principal, roomId));
    }

    @PostMapping("/rooms/{roomId}/leave")
    public ApiResponse<Void> leave(@AuthenticationPrincipal UserPrincipal principal,
                                   @PathVariable String roomId) {
        roomService.leaveRoom(principal.getUserId());
        return ApiResponse.ok("Đã rời phòng");
    }
}
