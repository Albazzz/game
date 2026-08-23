package admin.jlas.game.modules.airdefense.domain;

import lombok.Getter;

@Getter
public enum AugmentType {
    DUAL_CANNON("DUAL_CANNON", "Pháo Đôi", "Bắn 2 phát đạn mỗi khi khóa mục tiêu chính xác.", "OFFENSIVE", "✣", "rose"),
    CRYO_PAYLOAD("CRYO_PAYLOAD", "Đạn Băng Giá", "Làm chậm 20% tốc độ di chuyển của toàn bộ kẻ địch.", "CONTROL", "❄", "cyan"),
    GOLD_MAGNET("GOLD_MAGNET", "Nam Châm Vàng", "Hút Coin nhanh hơn và tăng 50% số lượng Coin nhận được.", "UTILITY", "◉", "amber"),
    SHIELD_BARRIER("SHIELD_BARRIER", "Lá Chắn Lượng Tử", "Tạo lớp khiên hấp thụ 3 lần va chạm kẻ địch kế tiếp.", "DEFENSIVE", "🛡", "cyan"),
    REPAIR_NANO("REPAIR_NANO", "Nano Phục Hồi", "Lập tức hồi phục 30% HP cho tàu chiến/hành tinh.", "DEFENSIVE", "✚", "rose"),
    CHRONO_FREEZE("CHRONO_FREEZE", "Ngưng Đọng Thời Gian", "Tăng thêm 1.5 giây thời gian phản xạ trước khi quái tiếp cận.", "UTILITY", "⏳", "violet"),
    PIERCING_ROUND("PIERCING_ROUND", "Đạn Xuyên Thấu", "Đạn bắn xuyên mục tiêu tiêu diệt thêm 1 quái vật phía sau.", "OFFENSIVE", "⚡", "violet");

    private final String id;
    private final String title;
    private final String description;
    private final String category;
    private final String icon;
    private final String tone;

    AugmentType(String id, String title, String description, String category, String icon, String tone) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.icon = icon;
        this.tone = tone;
    }
}
