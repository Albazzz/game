package admin.jlas.game.modules.memory.model;

import admin.jlas.game.modules.arena.domain.QuestionLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Nguồn từ vựng cho các minigame. Bảng riêng của module game để không nhân bản
 * hay ghi đè bảng từ vựng của app J-LAS (rule.md §5): khi merge, chỉ cần thay
 * repository này bằng adapter đọc bảng vocabulary thật.
 */
@Entity
@Table(name = "game_vocabulary", indexes = {
        @Index(name = "idx_game_vocab_level", columnList = "jlpt_level"),
        @Index(name = "uk_game_vocab_term", columnList = "term, reading", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameVocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vocab_id")
    private Long vocabId;

    /** Dạng viết (Kanji hoặc Katakana/Hiragana nếu từ không có Kanji). */
    @Column(name = "term", nullable = false, length = 100)
    private String term;

    /** Cách đọc Hiragana/Katakana. */
    @Column(name = "reading", nullable = false, length = 150)
    private String reading;

    /** Nghĩa tiếng Việt. */
    @Column(name = "meaning", nullable = false, length = 255)
    private String meaning;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 10)
    private QuestionLevel jlptLevel;

    @Column(name = "category", length = 60)
    private String category;
}
