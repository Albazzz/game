package admin.jlas.game.modules.arena.domain;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Metadata luật chơi tập trung — UI và service đều đọc từ đây, không hardcode
 * điều kiện start ở frontend (p1.md §6).
 */
public record GameRuleMetadata(
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
        Set<AnswerMode> supportedAnswerModes,
        AnswerMode defaultAnswerMode) {

    private static final Map<GameType, GameRuleMetadata> REGISTRY = buildRegistry();

    private static Map<GameType, GameRuleMetadata> buildRegistry() {
        Map<GameType, GameRuleMetadata> map = new LinkedHashMap<>();
        map.put(GameType.CANNON_BATTLE, new GameRuleMetadata(
                GameType.CANNON_BATTLE,
                "Air Defence",
                "Deep Space Sci-Fi · Tactical Roguelike",
                "Khóa mục tiêu Laser tự động, gõ tiếng Nhật bắn nổ quái vật không gian, nâng cấp Talent Tree và trang bị phi thuyền hiện đại.",
                1, 2, true, false, true,
                "Sci-Fi", "Roguelike / 1v1",
                EnumSet.of(AnswerMode.KANJI_TO_HIRAGANA, AnswerMode.KANJI_TO_MEANING),
                AnswerMode.KANJI_TO_HIRAGANA));
        map.put(GameType.CARD_DUEL, new GameRuleMetadata(
                GameType.CARD_DUEL,
                "Card Duel",
                "カード決闘 · 2-4",
                "Rút thẻ từ vựng, tính toán lượt đánh và dùng kỹ năng để áp đảo bàn đấu.",
                2, 4, false, false, false,
                "Tactical", "Free-for-all",
                EnumSet.of(AnswerMode.KANJI_TO_MEANING, AnswerMode.MEANING_TO_KANJI,
                        AnswerMode.HIRAGANA_TO_MEANING),
                AnswerMode.KANJI_TO_MEANING));
        map.put(GameType.MEMORY_MATCH, new GameRuleMetadata(
                GameType.MEMORY_MATCH,
                "Memory Match",
                "記憶合わせ · Solo / 2-4",
                "Luyện trí nhớ một mình hoặc lật cặp thẻ Kanji – nghĩa nhanh hơn đối thủ trong phòng 2–4 người.",
                2, 4, true, false, true,
                "Focus", "Solo / Race",
                EnumSet.of(AnswerMode.KANJI_TO_HIRAGANA, AnswerMode.KANJI_TO_MEANING,
                        AnswerMode.HIRAGANA_TO_MEANING),
                AnswerMode.KANJI_TO_MEANING));
        return Map.copyOf(map);
    }

    public static GameRuleMetadata of(GameType gameType) {
        GameRuleMetadata metadata = REGISTRY.get(gameType);
        if (metadata == null) {
            throw new IllegalArgumentException("Unknown game type: " + gameType);
        }
        return metadata;
    }

    public static List<GameRuleMetadata> all() {
        return List.copyOf(REGISTRY.values());
    }

    /** maxPlayers hợp lệ khi tạo phòng: nằm trong [minPlayers, maxPlayers]. */
    public int clampMaxPlayers(Integer requested) {
        if (requested == null) {
            return maxPlayers;
        }
        return Math.min(maxPlayers, Math.max(minPlayers, requested));
    }

    public boolean supports(AnswerMode mode) {
        return mode != null && supportedAnswerModes.contains(mode);
    }
}
