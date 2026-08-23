package admin.jlas.game.modules.memory.domain;

/** Cặp từ vựng đã dùng để sinh bàn — chỉ để hiển thị màn kết quả/ôn tập. */
public record MemoryPairInfo(int pairId, Long vocabId, String term, String reading, String meaning) {
}
