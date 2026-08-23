package admin.jlas.game.modules.memory.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.memory.domain.MemoryCard;
import admin.jlas.game.modules.memory.domain.MemoryCardFace;
import admin.jlas.game.modules.memory.domain.MemoryConfig;
import admin.jlas.game.modules.memory.domain.MemoryPairInfo;
import admin.jlas.game.modules.memory.model.GameVocabulary;
import admin.jlas.game.modules.memory.repository.GameVocabularyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Sinh bàn thẻ authoritative. Bàn chỉ tồn tại trên server; client không bao giờ
 * nhận pairId nên không thể tự suy ra cặp (p2-memory §4).
 */
@Component
public class MemoryBoardGenerator {

    private static final Logger log = LoggerFactory.getLogger(MemoryBoardGenerator.class);

    private final GameVocabularyRepository vocabularyRepository;

    public MemoryBoardGenerator(GameVocabularyRepository vocabularyRepository) {
        this.vocabularyRepository = vocabularyRepository;
    }

    public record Board(List<MemoryCard> cards, Map<Integer, MemoryPairInfo> pairInfo) {
    }

    public Board generate(MemoryConfig config) {
        return generate(config, new Random());
    }

    /** Random truyền vào để test có thể seed cố định. */
    public Board generate(MemoryConfig config, Random random) {
        int pairCount = config.pairCount();
        List<GameVocabulary> words = pickWords(config, pairCount);

        List<MemoryCard> cards = new ArrayList<>(pairCount * 2);
        Map<Integer, MemoryPairInfo> pairInfo = new LinkedHashMap<>();

        for (int pairId = 0; pairId < pairCount; pairId++) {
            GameVocabulary word = words.get(pairId);
            pairInfo.put(pairId, new MemoryPairInfo(pairId, word.getVocabId(),
                    word.getTerm(), word.getReading(), word.getMeaning()));

            cards.add(newCard(pairId, config.primaryFace(), contentFor(word, config.primaryFace())));
            cards.add(newCard(pairId, config.secondaryFace(), contentFor(word, config.secondaryFace())));
        }

        Collections.shuffle(cards, random);

        // position gán sau khi shuffle để trùng thứ tự hiển thị trên grid.
        List<MemoryCard> positioned = new ArrayList<>(cards.size());
        for (int position = 0; position < cards.size(); position++) {
            MemoryCard shuffled = cards.get(position);
            positioned.add(new MemoryCard(shuffled.getCardInstanceId(), shuffled.getPairId(),
                    position, shuffled.getFace(), shuffled.getContent()));
        }
        return new Board(positioned, pairInfo);
    }

    private MemoryCard newCard(int pairId, MemoryCardFace face, String content) {
        return new MemoryCard(UUID.randomUUID().toString(), pairId, -1, face, content);
    }

    private String contentFor(GameVocabulary word, MemoryCardFace face) {
        return switch (face) {
            case TERM -> word.getTerm();
            case READING -> word.getReading();
            case MEANING -> word.getMeaning();
        };
    }

    /**
     * Ưu tiên đúng level; nếu level đó chưa đủ từ thì lấy bù ở mọi level để ván
     * vẫn chơi được thay vì fail cả phòng.
     */
    private List<GameVocabulary> pickWords(MemoryConfig config, int pairCount) {
        List<GameVocabulary> words =
                new ArrayList<>(vocabularyRepository.randomByLevel(config.level().name(), pairCount));

        if (words.size() < pairCount) {
            log.warn("Level {} chỉ có {} từ, cần {} - lấy bù từ level khác",
                    config.level(), words.size(), pairCount);
            List<Long> usedIds = words.stream().map(GameVocabulary::getVocabId).toList();
            for (GameVocabulary extra : vocabularyRepository.randomAny(pairCount * 3)) {
                if (words.size() >= pairCount) {
                    break;
                }
                if (!usedIds.contains(extra.getVocabId())) {
                    words.add(extra);
                }
            }
        }
        if (words.size() < pairCount) {
            throw new ApiException(ErrorCode.MEMORY_VOCABULARY_INSUFFICIENT,
                    "Chưa đủ từ vựng để tạo bàn " + config.boardSize() + " thẻ");
        }
        return words.subList(0, pairCount);
    }
}
