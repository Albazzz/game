package admin.jlas.game.modules.arena.dto.response;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.arena.domain.GameType;

import java.util.List;

/** Metadata game cho trang /games và panel settings. */
public record GameCatalogItem(
        GameType gameType,
        String displayName,
        String tagline,
        String description,
        int minPlayers,
        int maxPlayers,
        boolean soloSupported,
        boolean teamBased,
        boolean implemented,
        String difficultyTag,
        String modeLabel,
        List<AnswerMode> supportedAnswerModes,
        AnswerMode defaultAnswerMode) {
}
