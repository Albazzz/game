package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.modules.airdefense.domain.AirDefenseTarget;
import admin.jlas.game.modules.airdefense.domain.AirDefenseTargetType;
import admin.jlas.game.modules.airdefense.domain.AugmentType;
import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.memory.model.GameVocabulary;
import admin.jlas.game.modules.memory.repository.GameVocabularyRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AirDefenseWaveManager {

    private final GameVocabularyRepository vocabularyRepository;

    public AirDefenseWaveManager(GameVocabularyRepository vocabularyRepository) {
        this.vocabularyRepository = vocabularyRepository;
    }

    public List<AirDefenseTarget> generateWaveTargets(int wave, QuestionLevel level) {
        int count = Math.min(3 + wave, 12);
        List<GameVocabulary> vocabList = vocabularyRepository.randomByLevel(level != null ? level.name() : "N5", count);
        if (vocabList == null || vocabList.isEmpty()) {
            vocabList = vocabularyRepository.randomAny(count);
        }
        if (vocabList == null) {
            vocabList = List.of();
        }

        List<AirDefenseTarget> targets = new ArrayList<>();
        double spacingX = 85.0 / Math.max(1, vocabList.size());

        for (int i = 0; i < vocabList.size(); i++) {
            GameVocabulary v = vocabList.get(i);
            AirDefenseTargetType type = (wave > 2 && i % 3 == 0) ? AirDefenseTargetType.SPACE_MINE : AirDefenseTargetType.MONSTER_NORMAL;
            if (wave > 4 && i % 4 == 0) {
                type = AirDefenseTargetType.MONSTER_FAST;
            }

            double posX = 7.5 + (i * spacingX);
            double posY = -(i * 12.0); // Xuất hiện sole nhau từ trên màn hình
            double speed = 0.5 + (wave * 0.08);

            List<String> aliases = new ArrayList<>();
            if (v.getMeaning() != null && !v.getMeaning().isBlank()) {
                aliases.add(v.getMeaning());
            }

            targets.add(AirDefenseTarget.builder()
                    .id("tgt_" + UUID.randomUUID().toString().substring(0, 8))
                    .term(v.getTerm())
                    .reading(v.getReading())
                    .meaning(v.getMeaning())
                    .aliases(aliases)
                    .type(type)
                    .posX(posX)
                    .posY(posY)
                    .speed(speed)
                    .maxHp(1)
                    .currentHp(1)
                    .isDead(false)
                    .spawnedAt(System.currentTimeMillis())
                    .build());
        }

        return targets;
    }

    public AirDefenseTarget generateDisruptionMiniBoss(QuestionLevel level) {
        List<GameVocabulary> list = vocabularyRepository.randomByLevel(level != null ? level.name() : "N5", 1);
        if (list == null || list.isEmpty()) list = vocabularyRepository.randomAny(1);

        GameVocabulary v = (list != null && !list.isEmpty()) ? list.get(0) : null;
        String term = v != null ? v.getTerm() : "侵略者";
        String reading = v != null ? v.getReading() : "しんりゃくしゃ";
        String meaning = v != null ? v.getMeaning() : "Kẻ xâm lăng";
        List<String> aliases = List.of(meaning);

        return AirDefenseTarget.builder()
                .id("boss_" + UUID.randomUUID().toString().substring(0, 8))
                .term(term)
                .reading(reading)
                .meaning(meaning)
                .aliases(aliases)
                .type(AirDefenseTargetType.MINI_BOSS)
                .posX(50.0)
                .posY(-15.0)
                .speed(0.35)
                .maxHp(3)
                .currentHp(3)
                .isDead(false)
                .spawnedAt(System.currentTimeMillis())
                .build();
    }

    public List<AugmentType> rollAugments(List<AugmentType> currentDraft, List<AugmentType> activeAugments) {
        List<AugmentType> available = Arrays.stream(AugmentType.values())
                .filter(a -> !activeAugments.contains(a))
                .filter(a -> !currentDraft.contains(a))
                .collect(Collectors.toList());

        if (available.size() < 3) {
            available = new ArrayList<>(Arrays.asList(AugmentType.values()));
        }

        Collections.shuffle(available);
        return available.subList(0, Math.min(3, available.size()));
    }
}
