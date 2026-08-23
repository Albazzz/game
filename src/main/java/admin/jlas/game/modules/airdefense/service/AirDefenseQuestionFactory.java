package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseConfig;
import admin.jlas.game.modules.airdefense.domain.AirDefenseQuestion;
import admin.jlas.game.modules.arena.domain.AnswerMode;
import admin.jlas.game.modules.memory.model.GameVocabulary;
import admin.jlas.game.modules.memory.repository.GameVocabularyRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/** Adapter đọc nguồn vocabulary hiện có; không tạo bảng/nội dung Air Defense riêng. */
@Component
public class AirDefenseQuestionFactory {

    private final GameVocabularyRepository vocabularyRepository;

    public AirDefenseQuestionFactory(GameVocabularyRepository vocabularyRepository) {
        this.vocabularyRepository = vocabularyRepository;
    }

    public List<AirDefenseQuestion> createDeck(AirDefenseConfig config) {
        int desired = config.questionCount();
        List<GameVocabulary> pool = new ArrayList<>(vocabularyRepository.randomByLevel(
                config.level().name(), Math.max(desired, 20)));
        if (pool.size() < desired) {
            for (GameVocabulary vocabulary : vocabularyRepository.randomAny(desired * 2)) {
                if (pool.stream().noneMatch(existing ->
                        existing.getVocabId().equals(vocabulary.getVocabId()))) {
                    pool.add(vocabulary);
                }
            }
        }
        if (pool.isEmpty()) {
            throw new ApiException(ErrorCode.MEMORY_VOCABULARY_INSUFFICIENT,
                    "Chưa có từ vựng để tạo câu hỏi Air Defense");
        }
        Collections.shuffle(pool);
        List<AirDefenseQuestion> deck = new ArrayList<>(desired);
        for (int index = 0; index < desired; index++) {
            GameVocabulary vocabulary = pool.get(index % pool.size());
            deck.add(toQuestion(vocabulary, config.answerMode(), index));
        }
        return deck;
    }

    private AirDefenseQuestion toQuestion(GameVocabulary vocabulary, AnswerMode mode, int index) {
        String expected = mode == AnswerMode.KANJI_TO_HIRAGANA
                ? vocabulary.getReading() : vocabulary.getMeaning();
        List<String> aliases = mode == AnswerMode.KANJI_TO_MEANING
                ? Arrays.stream(vocabulary.getMeaning().split("[,;/]"))
                    .map(String::trim).filter(value -> !value.isBlank()).toList()
                : List.of(vocabulary.getReading());
        long uniqueQuestionId = vocabulary.getVocabId() * 1_000L
                + index * 10L + ThreadLocalRandom.current().nextInt(10);
        return new AirDefenseQuestion(uniqueQuestionId, vocabulary.getTerm(), mode,
                expected, aliases);
    }
}
