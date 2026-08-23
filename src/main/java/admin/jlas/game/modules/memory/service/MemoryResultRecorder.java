package admin.jlas.game.modules.memory.service;

import admin.jlas.game.modules.arena.model.MatchStatus;
import admin.jlas.game.modules.arena.model.PlayerResult;
import admin.jlas.game.modules.arena.repository.GameMatchPlayerRepository;
import admin.jlas.game.modules.arena.repository.GameMatchRepository;
import admin.jlas.game.modules.memory.domain.MemoryPlayerState;
import admin.jlas.game.modules.memory.domain.MemorySession;
import admin.jlas.game.modules.memory.dto.MemoryResultView;
import admin.jlas.game.modules.memory.dto.MemoryStateView;
import admin.jlas.game.modules.memory.model.MemoryMatchResult;
import admin.jlas.game.modules.memory.repository.MemoryMatchResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;

/**
 * Persist kết quả ván tại mốc kết thúc: bảng riêng của game + cập nhật
 * {@code game_match}/{@code game_match_player} của arena (p2-memory §12).
 */
@Service
public class MemoryResultRecorder {

    private static final Logger log = LoggerFactory.getLogger(MemoryResultRecorder.class);

    private final MemoryMatchResultRepository resultRepository;
    private final GameMatchRepository matchRepository;
    private final GameMatchPlayerRepository matchPlayerRepository;
    private final Clock clock;

    public MemoryResultRecorder(MemoryMatchResultRepository resultRepository,
                                GameMatchRepository matchRepository,
                                GameMatchPlayerRepository matchPlayerRepository,
                                Clock clock) {
        this.resultRepository = resultRepository;
        this.matchRepository = matchRepository;
        this.matchPlayerRepository = matchPlayerRepository;
        this.clock = clock;
    }

    @Transactional
    public void recordFinish(MemorySession session, MemoryStateView state) {
        MemoryResultView result = state.result();
        if (result == null) {
            return;
        }
        Instant finishedAt = session.getFinishedAt() != null
                ? session.getFinishedAt()
                : Instant.now(clock);

        for (MemoryPlayerState player : session.orderedPlayers()) {
            if (resultRepository.existsBySessionIdAndUserId(
                    session.getSessionId(), player.getUserId())) {
                continue;
            }
            resultRepository.save(toEntity(session, state, player, finishedAt));
        }
        updateArenaMatch(session, state, finishedAt);
    }

    private MemoryMatchResult toEntity(MemorySession session, MemoryStateView state,
                                       MemoryPlayerState player, Instant finishedAt) {
        MemoryResultView result = state.result();
        boolean winner = result.winnerUserId() != null
                && result.winnerUserId().equals(player.getUserId());
        return MemoryMatchResult.builder()
                .sessionId(session.getSessionId())
                .matchId(session.getMatchId())
                .roomId(session.getRoomId())
                .userId(player.getUserId())
                .playMode(session.getPlayMode())
                .objective(session.getConfig().objective())
                .pairMode(session.getConfig().pairMode())
                .level(session.getConfig().level())
                .outcome(session.getOutcome())
                .boardSize(session.getConfig().boardSize())
                .pairsFound(player.getPairsFound())
                .mistakes(player.getMistakes())
                .moves(player.getMoves())
                .bestStreak(player.getBestStreak())
                .accuracyPercent(player.accuracyPercent())
                .averageDecisionMs(player.averageDecisionMs())
                .durationMs(result.durationMs())
                .ranked(result.ranked())
                .winner(winner)
                .finishedAt(finishedAt)
                .build();
    }

    /** Solo không có matchId nên bỏ qua; chỉ ván từ phòng mới cập nhật arena. */
    private void updateArenaMatch(MemorySession session, MemoryStateView state, Instant finishedAt) {
        Long matchId = session.getMatchId();
        if (matchId == null) {
            return;
        }
        MemoryResultView result = state.result();
        matchRepository.findById(matchId).ifPresent(match -> {
            match.setStatus(MatchStatus.COMPLETED);
            match.setEndedAt(finishedAt);
            match.setWinnerUserId(result.winnerUserId());
            matchRepository.save(match);
        });

        matchPlayerRepository.findByMatchIdOrderBySlotAsc(matchId).forEach(matchPlayer -> {
            MemoryPlayerState player = session.playersByUserId().get(matchPlayer.getUserId());
            if (player == null) {
                return;
            }
            matchPlayer.setScore(player.getPairsFound());
            matchPlayer.setResult(resultOf(result, player));
            matchPlayer.setDisconnected(!player.isConnected());
            matchPlayerRepository.save(matchPlayer);
        });
        log.debug("Đã cập nhật match {} từ memory session {}", matchId, session.getSessionId());
    }

    private PlayerResult resultOf(MemoryResultView result, MemoryPlayerState player) {
        if (!result.ranked()) {
            return PlayerResult.PENDING;
        }
        if (result.draw()) {
            return PlayerResult.DRAW;
        }
        return result.winnerUserId() != null && result.winnerUserId().equals(player.getUserId())
                ? PlayerResult.WIN
                : PlayerResult.LOSE;
    }
}
