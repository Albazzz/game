package admin.jlas.game.modules.memory.domain;

/**
 * Mặt nội dung của thẻ. Dùng để UI biết cần render font Nhật to (TERM/READING)
 * hay text nghĩa (MEANING), không phải để suy ra cặp.
 */
public enum MemoryCardFace {
    TERM,
    READING,
    MEANING
}
