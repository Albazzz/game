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

    public GameVocabulary() {}

    public static GameVocabularyBuilder builder() {
        return new GameVocabularyBuilder();
    }

    public static class GameVocabularyBuilder {
        private Long vocabId;
        private String term;
        private String reading;
        private String meaning;
        private QuestionLevel jlptLevel;
        private String category;

        public GameVocabularyBuilder vocabId(Long vocabId) { this.vocabId = vocabId; return this; }
        public GameVocabularyBuilder term(String term) { this.term = term; return this; }
        public GameVocabularyBuilder reading(String reading) { this.reading = reading; return this; }
        public GameVocabularyBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public GameVocabularyBuilder jlptLevel(QuestionLevel jlptLevel) { this.jlptLevel = jlptLevel; return this; }
        public GameVocabularyBuilder category(String category) { this.category = category; return this; }

        public GameVocabulary build() {
            GameVocabulary g = new GameVocabulary();
            g.vocabId = this.vocabId;
            g.term = this.term;
            g.reading = this.reading;
            g.meaning = this.meaning;
            g.jlptLevel = this.jlptLevel;
            g.category = this.category;
            return g;
        }
    }

    public Long getVocabId() { return vocabId; }
    public void setVocabId(Long vocabId) { this.vocabId = vocabId; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public QuestionLevel getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(QuestionLevel jlptLevel) { this.jlptLevel = jlptLevel; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
