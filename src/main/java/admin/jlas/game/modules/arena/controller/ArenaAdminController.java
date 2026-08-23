package admin.jlas.game.modules.arena.controller;

import admin.jlas.game.common.dto.ApiResponse;
import admin.jlas.game.modules.arena.dto.response.LobbyRoomView;
import admin.jlas.game.modules.arena.service.RoomService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoint quản trị Arena. Chỉ ADMIN / SUPER_ADMIN — chặn 2 lớp:
 * URL matcher trong SecurityConfig và {@code @PreAuthorize} ở đây.
 */
@RestController
@RequestMapping("/api/admin/arena")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class ArenaAdminController {

    private static final Logger log = LoggerFactory.getLogger(ArenaAdminController.class);

    private final RoomService roomService;

    public ArenaAdminController(RoomService roomService) {
        this.roomService = roomService;
    }

    /** Khác /api/games/lobby/rooms: trả cả phòng PRIVATE và phòng đang IN_GAME. */
    @GetMapping("/rooms")
    public ApiResponse<List<LobbyRoomView>> allRooms() {
        return ApiResponse.ok("Toàn bộ phòng", roomService.listAllRoomsForAdmin());
    }

    @DeleteMapping("/rooms/{roomId}")
    public ApiResponse<Void> closeRoom(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable String roomId,
                                      @RequestParam(required = false) String reason) {
        roomService.forceCloseRoom(roomId, reason == null || reason.isBlank() ? "admin" : reason);
        log.info("Admin {} closed room {}", principal.getEmail(), roomId);
        return ApiResponse.ok("Đã đóng phòng");
    }
}
