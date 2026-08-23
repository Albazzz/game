package admin.jlas.game.modules.arena.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.domain.GameSettings;
import admin.jlas.game.modules.arena.domain.GameType;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.domain.RoomStatus;
import admin.jlas.game.modules.arena.domain.RoomVisibility;
import admin.jlas.game.modules.arena.dto.ArenaEventType;
import admin.jlas.game.modules.arena.dto.request.CreateRoomRequest;
import admin.jlas.game.modules.arena.dto.request.UpdateSettingsRequest;
import admin.jlas.game.modules.arena.dto.response.LobbyRoomView;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.mapper.ArenaViewMapper;
import admin.jlas.game.modules.arena.runtime.ArenaBroadcaster;
import admin.jlas.game.modules.arena.runtime.ArenaGameFinishedEvent;
import admin.jlas.game.modules.arena.runtime.GameSessionLauncher;
import admin.jlas.game.modules.arena.runtime.RoomRegistry;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * Domain rules của Game Arena. Controller (REST/WS) chỉ làm transport.
 * Mọi mutate state chạy trong {@code room.withLock(...)}; broadcast thực hiện
 * sau khi đã nhả lock để tránh giữ lock khi I/O.
 */
@Service
public class RoomService {

    private static final Logger log = LoggerFactory.getLogger(RoomService.class);

    private final RoomRegistry registry;
    private final ArenaViewMapper viewMapper;
    private final ArenaBroadcaster broadcaster;
    private final MatchRecorder matchRecorder;
    private final GameSettingsValidator settingsValidator;
    private final GameProperties gameProperties;
    private final TaskScheduler taskScheduler;
    private final Clock clock;

    /** roomId -> task chuyển COUNTDOWN sang IN_GAME (chống start trùng). */
    private final Map<String, ScheduledFuture<?>> countdownTasks = new ConcurrentHashMap<>();
    /** userId -> task xoá player hết grace period khi phòng đang WAITING. */
    private final Map<Long, ScheduledFuture<?>> graceTasks = new ConcurrentHashMap<>();
    /** gameType -> engine của game đó (rỗng cho game chưa implement). */
    private final Map<GameType, GameSessionLauncher> sessionLaunchers;

    public RoomService(RoomRegistry registry,
                       ArenaViewMapper viewMapper,
                       ArenaBroadcaster broadcaster,
                       MatchRecorder matchRecorder,
                       GameSettingsValidator settingsValidator,
                       GameProperties gameProperties,
                       TaskScheduler taskScheduler,
                       Clock clock,
                       List<GameSessionLauncher> launchers) {
        this.registry = registry;
        this.viewMapper = viewMapper;
        this.broadcaster = broadcaster;
        this.matchRecorder = matchRecorder;
        this.settingsValidator = settingsValidator;
        this.gameProperties = gameProperties;
        this.taskScheduler = taskScheduler;
        this.clock = clock;
        Map<GameType, GameSessionLauncher> map = new java.util.EnumMap<>(GameType.class);
        for (GameSessionLauncher launcher : launchers) {
            map.put(launcher.gameType(), launcher);
        }
        this.sessionLaunchers = Map.copyOf(map);
    }

    // ===================== CREATE =====================

    public RoomStateView createRoom(UserPrincipal principal, CreateRoomRequest request) {
        GameType gameType = request.gameType();
        GameRuleMetadata metadata = GameRuleMetadata.of(gameType);
        RoomVisibility visibility = request.visibility() == null
                ? RoomVisibility.PRIVATE
                : request.visibility();
        int maxPlayers = metadata.clampMaxPlayers(request.maxPlayers());

        GameSettings settings = GameSettings.defaultsFor(gameType);
        if (request.settings() != null) {
            settings = validateAndMerge(metadata, settings, request.settings());
        }

        // Một account chỉ ở một phòng: rời phòng cũ trước khi tạo phòng mới.
        leaveCurrentRoomIfAny(principal.getUserId());

        GameRoom room = registry.createRoom(gameType, visibility, maxPlayers,
                principal.getUserId(), settings);

        RoomStateView state = room.withLock(() -> {
            addPlayerInternal(room, principal);
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return viewMapper.toRoomState(room);
        });
        registry.trackMembership(principal.getUserId(), room.getRoomId());
        log.info("Room {} created by user {} ({})", room.getRoomCode(), principal.getUserId(), gameType);
        return state;
    }

    // ===================== JOIN / LEAVE =====================

    public RoomStateView joinRoom(UserPrincipal principal, String roomId) {
        GameRoom room = registry.requireById(roomId);
        return joinInternal(principal, room);
    }

    public RoomStateView joinByCode(UserPrincipal principal, String roomCode) {
        GameRoom room = registry.findByCode(roomCode)
                .orElseThrow(() -> new ApiException(ErrorCode.ROOM_NOT_FOUND, "Mã phòng không tồn tại"));
        return joinInternal(principal, room);
    }

    private RoomStateView joinInternal(UserPrincipal principal, GameRoom room) {
        long userId = principal.getUserId();

        // Nếu đang ở phòng khác thì rời phòng đó (refresh/nhiều tab).
        registry.currentRoomIdOf(userId)
                .filter(existing -> !existing.equals(room.getRoomId()))
                .ifPresent(existing -> leaveRoom(userId));

        JoinOutcome outcome = room.withLock(() -> {
            if (room.getStatus().isTerminal()) {
                throw new ApiException(ErrorCode.ROOM_CLOSED);
            }
            Optional<RoomPlayer> existing = room.findPlayer(userId);
            if (existing.isPresent()) {
                // JOIN trùng lặp: coi như reconnect, không tạo player thứ hai.
                RoomPlayer player = existing.get();
                boolean wasDisconnected = !player.isConnected();
                player.setConnected(true);
                player.setDisconnectedAt(null);
                cancelGraceTask(userId);
                room.bumpVersion();
                room.touch(Instant.now(clock));
                return new JoinOutcome(viewMapper.toRoomState(room),
                        wasDisconnected ? ArenaEventType.PLAYER_RECONNECTED : null);
            }
            if (!room.getStatus().isJoinable()) {
                throw new ApiException(ErrorCode.ROOM_NOT_JOINABLE);
            }
            if (room.isFull()) {
                throw new ApiException(ErrorCode.ROOM_FULL);
            }
            addPlayerInternal(room, principal);
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return new JoinOutcome(viewMapper.toRoomState(room), ArenaEventType.PLAYER_JOINED);
        });

        registry.trackMembership(userId, room.getRoomId());
        if (outcome.eventType() != null) {
            broadcaster.broadcastStateSnapshot(room, outcome.eventType(), outcome.state());
        }
        return outcome.state();
    }

    private record JoinOutcome(RoomStateView state, String eventType) {
    }

    public void leaveRoom(long userId) {
        registry.currentRoomIdOf(userId)
                .flatMap(registry::findById)
                .ifPresent(room -> removePlayer(room, userId, true));
    }

    private void leaveCurrentRoomIfAny(long userId) {
        leaveRoom(userId);
    }

    /** Xoá player khỏi phòng; xử lý host migration và đóng phòng nếu rỗng. */
    private void removePlayer(GameRoom room, long userId, boolean broadcast) {
        cancelGraceTask(userId);

        RemoveOutcome outcome = room.withLock(() -> {
            RoomPlayer removed = room.playersByUserId().remove(userId);
            if (removed == null) {
                return new RemoveOutcome(null, false, false);
            }
            boolean hostChanged = false;
            if (room.isHost(userId) && !room.isEmpty()) {
                // Host migration: player join sớm nhất còn lại (p1.md §11).
                RoomPlayer next = room.playersByUserId().values().stream()
                        .min((a, b) -> a.getJoinedAt().compareTo(b.getJoinedAt()))
                        .orElse(null);
                if (next != null) {
                    room.setHostUserId(next.getUserId());
                    // Host mới không cần cờ ready.
                    next.setReady(false);
                    hostChanged = true;
                }
            }
            boolean closed = room.isEmpty();
            if (closed) {
                room.setStatus(RoomStatus.CLOSED);
                cancelCountdownTask(room.getRoomId());
            }
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return new RemoveOutcome(viewMapper.toRoomState(room), hostChanged, closed);
        });

        registry.untrackMembership(userId, room.getRoomId());
        if (outcome.state() == null) {
            return;
        }
        if (outcome.closed()) {
            abortGameSession(room);
            registry.remove(room);
            log.info("Room {} closed (empty)", room.getRoomCode());
            return;
        }
        if (broadcast) {
            broadcaster.broadcastStateSnapshot(room, ArenaEventType.PLAYER_LEFT, outcome.state());
            if (outcome.hostChanged()) {
                broadcaster.broadcastStateSnapshot(room, ArenaEventType.HOST_CHANGED, outcome.state());
            }
        }
    }

    private record RemoveOutcome(RoomStateView state, boolean hostChanged, boolean closed) {
    }

    // ===================== READY =====================

    public RoomStateView setReady(UserPrincipal principal, String roomId, boolean ready) {
        GameRoom room = registry.requireById(roomId);
        long userId = principal.getUserId();

        ReadyOutcome outcome = room.withLock(() -> {
            RoomPlayer player = room.findPlayer(userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_ROOM_MEMBER));
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new ApiException(ErrorCode.CONFLICT, "Không thể đổi trạng thái lúc này");
            }
            // READY gửi nhiều lần: idempotent, không bump version nếu không đổi.
            if (player.isReady() == ready) {
                return new ReadyOutcome(viewMapper.toRoomState(room), false);
            }
            player.setReady(ready);
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return new ReadyOutcome(viewMapper.toRoomState(room), true);
        });

        if (outcome.changed()) {
            broadcaster.broadcastStateSnapshot(room, ArenaEventType.PLAYER_UPDATED, outcome.state());
        }
        return outcome.state();
    }

    private record ReadyOutcome(RoomStateView state, boolean changed) {
    }

    // ===================== SETTINGS =====================

    public RoomStateView updateSettings(UserPrincipal principal, String roomId,
                                        UpdateSettingsRequest request) {
        GameRoom room = registry.requireById(roomId);
        long userId = principal.getUserId();

        RoomStateView state = room.withLock(() -> {
            room.findPlayer(userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_ROOM_MEMBER));
            if (!room.isHost(userId)) {
                throw new ApiException(ErrorCode.NOT_ROOM_HOST, "Chỉ chủ phòng đổi được cấu hình");
            }
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new ApiException(ErrorCode.CONFLICT, "Chỉ đổi cấu hình khi đang chờ");
            }
            GameRuleMetadata metadata = GameRuleMetadata.of(room.getGameType());
            room.setSettings(validateAndMerge(metadata, room.getSettings(), request));
            // Đổi cấu hình -> reset ready để mọi người xác nhận lại.
            room.playersByUserId().values().forEach(player -> player.setReady(false));
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return viewMapper.toRoomState(room);
        });

        broadcaster.broadcastStateSnapshot(room, ArenaEventType.ROOM_SETTINGS_UPDATED, state);
        return state;
    }

    /** Validate server-side: enum whitelist + range + answerMode phải được game hỗ trợ. */
    private GameSettings validateAndMerge(GameRuleMetadata metadata, GameSettings current,
                                          UpdateSettingsRequest request) {
        return settingsValidator.validateAndMerge(metadata, current, request);
    }

    // ===================== COUNTDOWN / START =====================

    public RoomStateView requestStart(UserPrincipal principal, String roomId) {
        GameRoom room = registry.requireById(roomId);
        long userId = principal.getUserId();
        int countdownSeconds = gameProperties.getArena().getCountdownSeconds();

        RoomStateView state = room.withLock(() -> {
            room.findPlayer(userId).orElseThrow(() -> new ApiException(ErrorCode.NOT_ROOM_MEMBER));
            if (!room.isHost(userId)) {
                throw new ApiException(ErrorCode.NOT_ROOM_HOST, "Chỉ chủ phòng bắt đầu được");
            }
            // Bấm start nhiều lần liên tiếp: lần thứ 2 trở đi bị chặn vì status đã đổi.
            if (room.getStatus() == RoomStatus.COUNTDOWN || room.getStatus() == RoomStatus.IN_GAME) {
                throw new ApiException(ErrorCode.CONFLICT, "Trận đã được bắt đầu");
            }
            String blocked = room.startBlockedReason();
            if (blocked != null) {
                throw new ApiException(ErrorCode.START_REQUIREMENTS_UNMET, blocked);
            }
            Instant now = Instant.now(clock);
            room.setStatus(RoomStatus.COUNTDOWN);
            room.setCountdownStartAt(now);
            room.setCountdownEndAt(now.plusSeconds(countdownSeconds));
            room.bumpVersion();
            room.touch(now);
            return viewMapper.toRoomState(room);
        });

        // Đặt task sau khi nhả lock; putIfAbsent để không bao giờ có 2 task/phòng.
        scheduleCountdownCompletion(room, state.countdownEndAt());
        broadcaster.broadcastStateSnapshot(room, ArenaEventType.COUNTDOWN_STARTED, state);
        return state;
    }

    private void scheduleCountdownCompletion(GameRoom room, Instant endAt) {
        ScheduledFuture<?> task = taskScheduler.schedule(() -> finishCountdown(room), endAt);
        ScheduledFuture<?> previous = countdownTasks.put(room.getRoomId(), task);
        if (previous != null) {
            previous.cancel(false);
        }
    }

    private void finishCountdown(GameRoom room) {
        countdownTasks.remove(room.getRoomId());

        StartOutcome outcome = room.withLock(() -> {
            if (room.getStatus() != RoomStatus.COUNTDOWN) {
                return null;
            }
            room.setStatus(RoomStatus.IN_GAME);
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return new StartOutcome(viewMapper.toRoomState(room), new ArrayList<>(room.orderedPlayers()));
        });

        if (outcome == null) {
            return;
        }
        Long matchId = matchRecorder.recordMatchStart(room, outcome.state(), outcome.players());
        if (matchId != null) {
            room.withLock(() -> room.setCurrentMatchRef(String.valueOf(matchId)));
        }

        // Engine gameplay của từng game (Phase 2+). Không có launcher -> phòng vẫn
        // vào IN_GAME nhưng client chỉ nhận thông báo, không có bàn chơi.
        String sessionId = launchGameSession(room, outcome, matchId);
        RoomStateView startedState = sessionId == null
                ? outcome.state()
                : room.withLock(() -> {
                    room.setCurrentSessionId(sessionId);
                    room.bumpVersion();
                    return viewMapper.toRoomState(room);
                });

        broadcaster.broadcastStateSnapshot(room, ArenaEventType.GAME_STARTED, startedState);
        log.info("Room {} entered IN_GAME (match {}, session {})",
                room.getRoomCode(), matchId, sessionId);
    }

    /** Engine đã chốt kết quả: giữ nguyên thành viên nhưng reset phòng để tái đấu. */
    @EventListener
    public void onGameFinished(ArenaGameFinishedEvent event) {
        registry.findById(event.roomId()).ifPresent(room -> {
            RoomStateView state = room.withLock(() -> {
                if (room.getStatus() != RoomStatus.IN_GAME
                        || !event.sessionId().equals(room.getCurrentSessionId())) {
                    return null;
                }
                room.setStatus(RoomStatus.WAITING);
                room.setCurrentSessionId(null);
                room.setCurrentMatchRef(null);
                room.setCountdownStartAt(null);
                room.setCountdownEndAt(null);
                room.orderedPlayers().forEach(player -> player.setReady(false));
                room.bumpVersion();
                room.touch(Instant.now(clock));
                return viewMapper.toRoomState(room);
            });
            if (state != null) {
                broadcaster.broadcastStateSnapshot(room, ArenaEventType.GAME_FINISHED, state);
            }
        });
    }

    /** Engine của game dừng session khi phòng đóng giữa ván; lỗi không được lan ra. */
    private void abortGameSession(GameRoom room) {
        GameSessionLauncher launcher = sessionLaunchers.get(room.getGameType());
        if (launcher == null) {
            return;
        }
        try {
            launcher.abortByRoom(room.getRoomId());
        } catch (Exception ex) {
            log.warn("Không dừng được session {} của room {}: {}",
                    room.getGameType(), room.getRoomCode(), ex.getMessage());
        }
    }

    /** Gọi launcher khớp gameType; lỗi engine không được làm sập luồng start. */
    private String launchGameSession(GameRoom room, StartOutcome outcome, Long matchId) {
        GameSessionLauncher launcher = sessionLaunchers.get(room.getGameType());
        if (launcher == null) {
            return null;
        }
        try {
            return launcher.launch(room, outcome.state(), outcome.players(), matchId);
        } catch (Exception ex) {
            log.warn("Không tạo được session {} cho room {}: {}",
                    room.getGameType(), room.getRoomCode(), ex.getMessage());
            return null;
        }
    }

    private record StartOutcome(RoomStateView state, List<RoomPlayer> players) {
    }

    private void cancelCountdownTask(String roomId) {
        ScheduledFuture<?> task = countdownTasks.remove(roomId);
        if (task != null) {
            task.cancel(false);
        }
    }

    // ===================== DISCONNECT / RECONNECT =====================

    /** WS ngắt: đánh dấu offline, giữ chỗ trong grace period (p1.md §10). */
    public void handleDisconnect(long userId, String sessionId) {
        registry.currentRoomIdOf(userId)
                .flatMap(registry::findById)
                .ifPresent(room -> {
                    RoomStateView state = room.withLock(() -> {
                        RoomPlayer player = room.findPlayer(userId).orElse(null);
                        if (player == null || !player.isConnected()) {
                            return null;
                        }
                        // Chỉ xử lý nếu đúng session đang giữ (tránh tab cũ đóng làm mất tab mới).
                        if (sessionId != null && player.getSessionId() != null
                                && !sessionId.equals(player.getSessionId())) {
                            return null;
                        }
                        player.setConnected(false);
                        player.setReady(false);
                        player.setDisconnectedAt(Instant.now(clock));
                        room.bumpVersion();
                        return viewMapper.toRoomState(room);
                    });
                    if (state == null) {
                        return;
                    }
                    scheduleGraceRemoval(room, userId);
                    broadcaster.broadcastStateSnapshot(room, ArenaEventType.PLAYER_UPDATED, state);
                });
    }

    private void scheduleGraceRemoval(GameRoom room, long userId) {
        Instant deadline = Instant.now(clock)
                .plusSeconds(gameProperties.getArena().getReconnectGraceSeconds());
        ScheduledFuture<?> task = taskScheduler.schedule(() -> {
            graceTasks.remove(userId);
            boolean stillOffline = room.withLock(() -> room.findPlayer(userId)
                    .map(player -> !player.isConnected())
                    .orElse(false));
            if (!stillOffline) {
                return;
            }
            // WAITING: loại khỏi phòng. IN_GAME: giữ chỗ, phase gameplay quyết định forfeit.
            if (room.getStatus() == RoomStatus.WAITING) {
                removePlayer(room, userId, true);
            }
        }, deadline);
        ScheduledFuture<?> previous = graceTasks.put(userId, task);
        if (previous != null) {
            previous.cancel(false);
        }
    }

    private void cancelGraceTask(long userId) {
        ScheduledFuture<?> task = graceTasks.remove(userId);
        if (task != null) {
            task.cancel(false);
        }
    }

    /** Gắn sessionId hiện tại (dùng khi client SUBSCRIBE thành công). */
    public void bindSession(long userId, String roomId, String sessionId) {
        registry.findById(roomId).ifPresent(room -> room.withLock(() ->
                room.findPlayer(userId).ifPresent(player -> player.setSessionId(sessionId))));
    }

    // ===================== QUERIES =====================

    public RoomStateView getRoomState(UserPrincipal principal, String roomId) {
        GameRoom room = registry.requireById(roomId);
        return room.withLock(() -> {
            room.findPlayer(principal.getUserId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_ROOM_MEMBER));
            return viewMapper.toRoomState(room);
        });
    }

    public List<LobbyRoomView> listPublicRooms() {
        List<LobbyRoomView> views = new ArrayList<>();
        for (GameRoom room : registry.snapshotAll()) {
            if (room.getVisibility() != RoomVisibility.PUBLIC) {
                continue;
            }
            views.add(room.withLock(() -> viewMapper.toLobbyView(room)));
        }
        views.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
        return views;
    }

    public int onlinePlayerCount() {
        return registry.connectedPlayerCount();
    }

    public int activeRoomCount() {
        return registry.roomCount();
    }

    // ===================== ADMIN =====================

    /**
     * Danh sách mọi phòng (kể cả PRIVATE và đang IN_GAME) cho trang quản trị.
     * Không dùng cho lobby người chơi — xem {@link #listPublicRooms()}.
     */
    public List<LobbyRoomView> listAllRoomsForAdmin() {
        List<LobbyRoomView> views = new ArrayList<>();
        for (GameRoom room : registry.snapshotAll()) {
            views.add(room.withLock(() -> viewMapper.toLobbyView(room)));
        }
        views.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
        return views;
    }

    /** Admin đóng phòng: huỷ countdown, thông báo cho member rồi xoá khỏi registry. */
    public void forceCloseRoom(String roomId, String reason) {
        GameRoom room = registry.requireById(roomId);
        RoomStateView state = room.withLock(() -> {
            room.setStatus(RoomStatus.CLOSED);
            room.bumpVersion();
            room.touch(Instant.now(clock));
            return viewMapper.toRoomState(room);
        });
        cancelCountdownTask(room.getRoomId());
        room.playersByUserId().keySet().forEach(this::cancelGraceTask);
        abortGameSession(room);
        broadcaster.broadcastStateSnapshot(room, ArenaEventType.ROOM_CLOSED, state);
        registry.remove(room);
        log.info("Room {} force-closed by admin (reason={})", room.getRoomCode(), reason);
    }

    // ===================== HELPERS / LIFECYCLE =====================

    /** Phải gọi trong lock. Slot & team suy ra từ metadata, không nhận từ client. */
    private void addPlayerInternal(GameRoom room, UserPrincipal principal) {
        int slot = room.nextFreeSlot();
        GameRuleMetadata metadata = GameRuleMetadata.of(room.getGameType());
        Integer team = metadata.teamBased() ? slot % 2 : null;
        RoomPlayer player = new RoomPlayer(
                UUID.randomUUID().toString(),
                principal.getUserId(),
                principal.getDisplayName(),
                principal.getAvatar(),
                slot,
                team,
                Instant.now(clock));
        room.playersByUserId().put(principal.getUserId(), player);
    }

    /** Dọn phòng quá hạn / đã đóng. Chạy theo {@code game.arena.sweep-interval-ms}. */
    public void sweepExpiredRooms() {
        Instant threshold = Instant.now(clock)
                .minus(Duration.ofMinutes(gameProperties.getArena().getRoomIdleTimeoutMinutes()));
        for (GameRoom room : registry.snapshotAll()) {
            boolean expired = room.withLock(() -> {
                if (room.getStatus() == RoomStatus.IN_GAME) {
                    return false;
                }
                if (room.isEmpty()) {
                    return true;
                }
                return room.getLastActivityAt().isBefore(threshold);
            });
            if (!expired) {
                continue;
            }
            RoomStateView state = room.withLock(() -> {
                room.setStatus(RoomStatus.CLOSED);
                room.bumpVersion();
                return viewMapper.toRoomState(room);
            });
            cancelCountdownTask(room.getRoomId());
            room.playersByUserId().keySet().forEach(this::cancelGraceTask);
            abortGameSession(room);
            broadcaster.broadcastStateSnapshot(room, ArenaEventType.ROOM_CLOSED, state);
            registry.remove(room);
            log.info("Room {} closed (idle/expired)", room.getRoomCode());
        }
    }
}
