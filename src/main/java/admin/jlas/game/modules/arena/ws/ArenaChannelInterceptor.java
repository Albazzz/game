package admin.jlas.game.modules.arena.ws;

import admin.jlas.game.modules.arena.runtime.RoomRegistry;
import admin.jlas.game.modules.auth.security.CustomUserDetailsService;
import admin.jlas.game.modules.auth.security.JwtService;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import admin.jlas.game.modules.memory.runtime.MemorySessionRegistry;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * CONNECT: xác thực JWT và gắn Principal.
 * SUBSCRIBE: chỉ cho phép topic của phòng mà user đang là thành viên (p1.md §16 —
 * chặn subscribe tuỳ ý sang phòng private khác).
 */
@Component
public class ArenaChannelInterceptor implements ChannelInterceptor {

    private static final String ROOM_TOPIC_PREFIX = "/topic/arena/room/";
    private static final String MEMORY_TOPIC_PREFIX = "/topic/memory/";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RoomRegistry roomRegistry;
    private final MemorySessionRegistry memorySessionRegistry;

    public ArenaChannelInterceptor(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService,
                                   RoomRegistry roomRegistry,
                                   MemorySessionRegistry memorySessionRegistry) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.roomRegistry = roomRegistry;
        this.memorySessionRegistry = memorySessionRegistry;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscription(accessor);
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        // Handshake đi qua servlet filter chain nên JwtAuthenticationFilter đã xác
        // thực bằng cookie HttpOnly; khi đó Principal có sẵn, không cần header.
        if (currentUserId(accessor) != null) {
            return;
        }
        String token = firstHeader(accessor, "Authorization");
        if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        } else {
            token = firstHeader(accessor, "X-Auth-Token");
        }
        if (!StringUtils.hasText(token)) {
            throw new MessagingException("Thiếu token xác thực cho kết nối WebSocket");
        }
        try {
            String username = jwtService.extractUsername(token);
            var userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new MessagingException("Token WebSocket không hợp lệ");
            }
            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()));
        } catch (MessagingException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new MessagingException("Không xác thực được kết nối WebSocket");
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }
        if (destination.startsWith(ROOM_TOPIC_PREFIX)) {
            authorizeRoomTopic(accessor, destination.substring(ROOM_TOPIC_PREFIX.length()));
        } else if (destination.startsWith(MEMORY_TOPIC_PREFIX)) {
            authorizeMemoryTopic(accessor, destination.substring(MEMORY_TOPIC_PREFIX.length()));
        }
    }

    private void authorizeRoomTopic(StompHeaderAccessor accessor, String roomId) {
        Long userId = requireUserId(accessor);
        boolean member = roomRegistry.findById(roomId)
                .map(room -> room.withLock(() -> room.findPlayer(userId).isPresent()))
                .orElse(false);
        if (!member) {
            throw new MessagingException("Bạn không ở trong phòng này");
        }
    }

    /** Chỉ người chơi trong ván mới nhận được event bàn Memory (rule.md §9). */
    private void authorizeMemoryTopic(StompHeaderAccessor accessor, String sessionId) {
        Long userId = requireUserId(accessor);
        boolean participant = memorySessionRegistry.findById(sessionId)
                .map(session -> session.withLock(
                        () -> session.playersByUserId().containsKey(userId)))
                .orElse(false);
        if (!participant) {
            throw new MessagingException("Bạn không ở trong ván này");
        }
    }

    private Long requireUserId(StompHeaderAccessor accessor) {
        Long userId = currentUserId(accessor);
        if (userId == null) {
            throw new MessagingException("Chưa xác thực");
        }
        return userId;
    }

    private Long currentUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication auth
                && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return null;
    }

    private String firstHeader(StompHeaderAccessor accessor, String name) {
        List<String> values = accessor.getNativeHeader(name);
        return values == null || values.isEmpty() ? null : values.get(0);
    }
}
