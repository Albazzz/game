package admin.jlas.game.modules.memory.dto;

import admin.jlas.game.modules.memory.domain.MemoryOutcome;
import admin.jlas.game.modules.memory.domain.MemoryPlayMode;
import admin.jlas.game.modules.memory.domain.MemorySessionStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Snapshot đầy đủ để render/reconnect (p2-memory §13). Đây là payload duy nhất
 * client cần: mọi event đều kèm snapshot mới nhất nên client không phải tự suy state.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemoryStateView(
        String sessionId,
        String roomId,
        MemoryPlayMode playMode,
        MemorySessionStatus status,
        MemoryConfigView config,
        List<MemoryCardView> cards,
        List<MemoryPlayerView> players,
        long stateVersion,
        Long currentTurnUserId,
        boolean resolving,
        int pairsMatched,
        int pairsTotal,
        int movesUsed,
        Integer movesRemaining,
        Instant turnStartedAt,
        Instant turnDeadlineAt,
        Instant totalDeadlineAt,
        long elapsedMs,
        MemoryOutcome outcome,
        boolean ranked,
        MemoryResultView result,
        Instant serverTime) {
}
