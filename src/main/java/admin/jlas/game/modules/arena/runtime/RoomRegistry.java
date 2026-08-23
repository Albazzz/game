package admin.jlas.game.modules.arena.runtime;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomVisibility;
import admin.jlas.game.modules.arena.support.RoomCodeGenerator;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry phòng in-memory (theo pattern InMemoryConversationRuntimeStore của app
 * J-LAS). Không ghi DB cho state chờ; chỉ match kết thúc mới persist.
 */
@Component
public class RoomRegistry {

    private static final int MAX_CODE_ATTEMPTS = 12;

    private final Map<String, GameRoom> roomsById = new ConcurrentHashMap<>();
    private final Map<String, String> roomIdByCode = new ConcurrentHashMap<>();
    /** userId -> roomId, để reconnect và chặn 1 account ở 2 phòng. */
    private final Map<Long, String> roomIdByUserId = new ConcurrentHashMap<>();

    private final RoomCodeGenerator codeGenerator;
    private final GameProperties gameProperties;
    private final Clock clock;

    public RoomRegistry(RoomCodeGenerator codeGenerator, GameProperties gameProperties, Clock clock) {
        this.codeGenerator = codeGenerator;
        this.gameProperties = gameProperties;
        this.clock = clock;
    }

    public GameRoom createRoom(GameType gameType, RoomVisibility visibility, int maxPlayers,
                               long hostUserId, GameSettings settings) {
        if (roomsById.size() >= gameProperties.getArena().getMaxRooms()) {
            throw new ApiException(ErrorCode.TOO_MANY_REQUESTS, "Server đang quá tải phòng, thử lại sau");
        }
        Instant now = Instant.now(clock);
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String code = codeGenerator.newRoomCode();
            String roomId = codeGenerator.newRoomId();
            GameRoom room = new GameRoom(roomId, code, gameType, visibility, maxPlayers,
                    hostUserId, settings, now);
            // Chốt code trước để chống trùng, rồi mới publish room.
            if (roomIdByCode.putIfAbsent(normalizeCode(code), roomId) == null) {
                roomsById.put(roomId, room);
                return room;
            }
        }
        throw new ApiException(ErrorCode.INTERNAL_ERROR, "Không tạo được mã phòng, vui lòng thử lại");
    }

    public Optional<GameRoom> findById(String roomId) {
        return roomId == null ? Optional.empty() : Optional.ofNullable(roomsById.get(roomId));
    }

    public GameRoom requireById(String roomId) {
        return findById(roomId).orElseThrow(() -> new ApiException(ErrorCode.ROOM_NOT_FOUND));
    }

    public Optional<GameRoom> findByCode(String roomCode) {
        if (roomCode == null || roomCode.isBlank()) {
            return Optional.empty();
        }
        String roomId = roomIdByCode.get(normalizeCode(roomCode));
        return roomId == null ? Optional.empty() : findById(roomId);
    }

    public Optional<String> currentRoomIdOf(long userId) {
        return Optional.ofNullable(roomIdByUserId.get(userId));
    }

    public void trackMembership(long userId, String roomId) {
        roomIdByUserId.put(userId, roomId);
    }

    /** Chỉ xoá mapping nếu user vẫn đang gắn với đúng phòng đó. */
    public void untrackMembership(long userId, String roomId) {
        roomIdByUserId.remove(userId, roomId);
    }

    public void remove(GameRoom room) {
        roomsById.remove(room.getRoomId());
        roomIdByCode.remove(normalizeCode(room.getRoomCode()), room.getRoomId());
        room.playersByUserId().keySet()
                .forEach(userId -> roomIdByUserId.remove(userId, room.getRoomId()));
    }

    public List<GameRoom> snapshotAll() {
        return new ArrayList<>(roomsById.values());
    }

    public int roomCount() {
        return roomsById.size();
    }

    /** Số người đang có mặt trong các phòng — dùng cho hero "online". */
    public int connectedPlayerCount() {
        return roomsById.values().stream()
                .mapToInt(room -> (int) room.playersByUserId().values().stream()
                        .filter(player -> player.isConnected())
                        .count())
                .sum();
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }
}
