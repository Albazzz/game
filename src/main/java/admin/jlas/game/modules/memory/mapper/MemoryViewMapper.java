package admin.jlas.game.modules.memory.mapper;

import admin.jlas.game.config.GameProperties;
import admin.jlas.game.modules.memory.domain.MemoryCard;
import admin.jlas.game.modules.memory.domain.MemoryCardState;
import admin.jlas.game.modules.memory.domain.MemoryConfig;
import admin.jlas.game.modules.memory.domain.MemoryPairInfo;
import admin.jlas.game.modules.memory.domain.MemoryPlayerState;
import admin.jlas.game.modules.memory.domain.MemorySession;
import admin.jlas.game.modules.memory.domain.MemorySessionStatus;
import admin.jlas.game.modules.memory.dto.MemoryCardView;
import admin.jlas.game.modules.memory.dto.MemoryConfigView;
import admin.jlas.game.modules.memory.dto.MemoryPlayerView;
import admin.jlas.game.modules.memory.dto.MemoryResultView;
import admin.jlas.game.modules.memory.dto.MemoryStateView;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Domain -> DTO. Đây là chốt duy nhất đảm bảo thẻ HIDDEN không rò content và
 * pairId không bao giờ ra khỏi server (p2-memory §14).
 */
@Component
public class MemoryViewMapper {

    private final GameProperties gameProperties;
    private final Clock clock;

    public MemoryViewMapper(GameProperties gameProperties, Clock clock) {
        this.gameProperties = gameProperties;
        this.clock = clock;
    }

    public MemoryStateView toStateView(MemorySession session) {
        Instant now = Instant.now(clock);
        boolean finished = session.getStatus() == MemorySessionStatus.FINISHED;

        return new MemoryStateView(
                session.getSessionId(),
                session.getRoomId(),
                session.getPlayMode(),
                session.getStatus(),
                toConfigView(session.getConfig()),
                session.getCards().stream().map(this::toCardView).toList(),
                toPlayerViews(session),
                session.getStateVersion(),
                session.getCurrentTurnUserId() == 0 ? null : session.getCurrentTurnUserId(),
                session.isResolving(),
                session.getPairsMatched(),
                session.getConfig().pairCount(),
                session.getMovesUsed(),
                session.movesRemaining(),
                session.getTurnStartedAt(),
                session.getTurnDeadlineAt(),
                session.getTotalDeadlineAt(),
                session.elapsedMs(now),
                session.getOutcome(),
                isRanked(session),
                finished ? toResultView(session) : null,
                now);
    }

    public MemoryConfigView toConfigView(MemoryConfig config) {
        return new MemoryConfigView(
                config.boardSize(),
                config.pairCount(),
                config.objective(),
                config.pairMode(),
                config.level(),
                config.turnSeconds(),
                config.totalSeconds(),
                config.moveLimit(),
                config.keepTurnOnMatch(),
                gameProperties.getMemory().getRevealDelayMs());
    }

    public MemoryCardView toCardView(MemoryCard card) {
        boolean visible = card.isContentVisible();
        return new MemoryCardView(
                card.getCardInstanceId(),
                card.getPosition(),
                card.getState(),
                visible ? card.getFace() : null,
                visible ? card.getContent() : null,
                card.getState() == MemoryCardState.MATCHED ? card.getMatchedByUserId() : null);
    }

    public List<MemoryPlayerView> toPlayerViews(MemorySession session) {
        return session.orderedPlayers().stream()
                .map(player -> toPlayerView(session, player))
                .toList();
    }

    public MemoryPlayerView toPlayerView(MemorySession session, MemoryPlayerState player) {
        return new MemoryPlayerView(
                player.getUserId(),
                player.getDisplayName(),
                player.getAvatar(),
                player.getSlot(),
                player.getPairsFound(),
                player.getMistakes(),
                player.getMoves(),
                player.getStreak(),
                player.getBestStreak(),
                player.accuracyPercent(),
                player.averageDecisionMs(),
                player.isConnected(),
                session.isMyTurn(player.getUserId()));
    }

    /** Ván xếp hạng: multiplayer từ phòng và có ít nhất 2 người. */
    private boolean isRanked(MemorySession session) {
        return session.getRoomId() != null && session.playersByUserId().size() > 1;
    }

    /** Chỉ gọi khi ván đã kết thúc — danh sách từ là đáp án của cả bàn. */
    public MemoryResultView toResultView(MemorySession session) {
        List<MemoryPlayerState> ranked = session.orderedPlayers().stream()
                .sorted(Comparator.comparingInt(MemoryPlayerState::getPairsFound).reversed()
                        .thenComparingInt(MemoryPlayerState::getMistakes))
                .toList();

        Long winner = null;
        boolean draw = false;
        if (ranked.size() > 1) {
            MemoryPlayerState top = ranked.get(0);
            MemoryPlayerState second = ranked.get(1);
            draw = top.getPairsFound() == second.getPairsFound()
                    && top.getMistakes() == second.getMistakes();
            winner = draw ? null : top.getUserId();
        } else if (ranked.size() == 1 && session.isBoardCleared()) {
            winner = ranked.get(0).getUserId();
        }

        Map<Integer, Integer> mistakes = session.getMistakesByPair();
        List<MemoryResultView.MemoryTermView> terms = session.pairInfo().values().stream()
                .map(info -> toTermView(info, mistakes.getOrDefault(info.pairId(), 0)))
                .toList();
        List<MemoryResultView.MemoryTermView> struggling = terms.stream()
                .filter(term -> term.mistakes() > 0)
                .sorted(Comparator.comparingInt(MemoryResultView.MemoryTermView::mistakes).reversed())
                .limit(5)
                .toList();

        return new MemoryResultView(
                session.isBoardCleared(),
                isRanked(session),
                winner,
                draw,
                session.elapsedMs(Instant.now(clock)),
                terms,
                struggling);
    }

    private MemoryResultView.MemoryTermView toTermView(MemoryPairInfo info, int mistakes) {
        return new MemoryResultView.MemoryTermView(
                info.term(), info.reading(), info.meaning(), mistakes);
    }
}
