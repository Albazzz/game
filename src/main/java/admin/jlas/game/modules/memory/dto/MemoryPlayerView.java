package admin.jlas.game.modules.memory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemoryPlayerView(
        long userId,
        String displayName,
        String avatar,
        int slot,
        int pairsFound,
        int mistakes,
        int moves,
        int streak,
        int bestStreak,
        Integer accuracyPercent,
        Integer averageDecisionMs,
        boolean connected,
        boolean currentTurn) {
}
