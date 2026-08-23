package admin.jlas.game.modules.arena.service;

import admin.jlas.game.modules.arena.domain.GameRoom;
import admin.jlas.game.modules.arena.domain.RoomPlayer;
import admin.jlas.game.modules.arena.dto.response.RoomStateView;
import admin.jlas.game.modules.arena.model.GameMatch;
import admin.jlas.game.modules.arena.model.GameMatchPlayer;
import admin.jlas.game.modules.arena.model.MatchStatus;
import admin.jlas.game.modules.arena.model.PlayerResult;
import admin.jlas.game.modules.arena.repository.GameMatchPlayerRepository;
import admin.jlas.game.modules.arena.repository.GameMatchRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

/**
 * Ghi DB chỉ tại các mốc quan trọng (rule.md: không ghi state tạm thời mỗi frame).
 * Phase 1 ghi lúc GAME_STARTED; phase gameplay sẽ cập nhật score/result.
 */
@Service
public class MatchRecorder {

    private static final Logger log = LoggerFactory.getLogger(MatchRecorder.class);

    private final GameMatchRepository matchRepository;
    private final GameMatchPlayerRepository matchPlayerRepository;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public MatchRecorder(GameMatchRepository matchRepository,
                         GameMatchPlayerRepository matchPlayerRepository,
                         ObjectMapper objectMapper,
                         Clock clock) {
        this.matchRepository = matchRepository;
        this.matchPlayerRepository = matchPlayerRepository;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    /** Trả matchId, hoặc null nếu ghi thất bại (không được làm sập luồng start). */
    @Transactional
    public Long recordMatchStart(GameRoom room, RoomStateView snapshot, List<RoomPlayer> players) {
        try {
            GameMatch match = matchRepository.save(GameMatch.builder()
                    .roomId(room.getRoomId())
                    .roomCode(room.getRoomCode())
                    .gameType(room.getGameType())
                    .status(MatchStatus.IN_PROGRESS)
                    .startedAt(Instant.now(clock))
                    .settingsSnapshot(serializeSettings(snapshot))
                    .build());

            for (RoomPlayer player : players) {
                matchPlayerRepository.save(GameMatchPlayer.builder()
                        .matchId(match.getMatchId())
                        .userId(player.getUserId())
                        .displayName(player.getDisplayName())
                        .slot(player.getSlot())
                        .team(player.getTeam())
                        .score(0)
                        .result(PlayerResult.PENDING)
                        .joinedAt(player.getJoinedAt())
                        .disconnected(!player.isConnected())
                        .build());
            }
            return match.getMatchId();
        } catch (Exception ex) {
            log.warn("Không ghi được match cho room {}: {}", room.getRoomId(), ex.getMessage());
            return null;
        }
    }

    @Transactional
    public void markAborted(Long matchId) {
        if (matchId == null) {
            return;
        }
        matchRepository.findById(matchId).ifPresent(match -> {
            match.setStatus(MatchStatus.ABORTED);
            match.setEndedAt(Instant.now(clock));
            matchRepository.save(match);
        });
    }

    private String serializeSettings(RoomStateView snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot.settings());
        } catch (JsonProcessingException ex) {
            return null;
        }
    }
}
