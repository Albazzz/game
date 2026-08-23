package admin.jlas.game.modules.memory.domain;

/** Mục tiêu ván đấu (p2-memory §1A, §7). */
public enum MemoryObjective {
    /** Lật hết bàn, không giới hạn ngoài turn timer. */
    CLASSIC,
    /** Có tổng thời gian; hết giờ trước khi clear bàn là thất bại. */
    TIME_ATTACK,
    /** Giới hạn số lượt lật (chỉ solo). */
    MOVE_LIMIT
}
