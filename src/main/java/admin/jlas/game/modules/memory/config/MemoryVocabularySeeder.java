package admin.jlas.game.modules.memory.config;

import admin.jlas.game.modules.arena.domain.QuestionLevel;
import admin.jlas.game.modules.memory.model.GameVocabulary;
import admin.jlas.game.modules.memory.repository.GameVocabularyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.List;

/**
 * Seed từ vựng cho minigame khi bảng còn trống ({@code ddl-auto=update} tạo bảng
 * nhưng không nạp dữ liệu). Nội dung khớp
 * {@code sql/migrations/V20260822_03__create_memory_match.sql}; chạy sau seeder
 * role/user nên dùng Order 3.
 */
@Configuration
public class MemoryVocabularySeeder {

    private static final Logger log = LoggerFactory.getLogger(MemoryVocabularySeeder.class);

    /** Bàn lớn nhất là 40 thẻ = 20 cặp, nên mỗi level cần tối thiểu 20 từ. */
    private static final int MIN_PER_LEVEL = 20;

    @Bean
    @Order(3)
    public ApplicationRunner seedMemoryVocabulary(GameVocabularyRepository repository) {
        return args -> {
            try {
                seedLevel(repository, QuestionLevel.N5, n5());
                seedLevel(repository, QuestionLevel.N4, n4());
            } catch (Exception ex) {
                // Không chặn boot: thiếu từ vựng chỉ làm Memory Match không sinh được bàn.
                log.warn("Seed game_vocabulary thất bại: {}", ex.getMessage());
            }
        };
    }

    private void seedLevel(GameVocabularyRepository repository, QuestionLevel level,
                           List<String[]> rows) {
        if (repository.countByJlptLevel(level) >= MIN_PER_LEVEL) {
            return;
        }
        List<GameVocabulary> batch = new ArrayList<>(rows.size());
        for (String[] row : rows) {
            batch.add(GameVocabulary.builder()
                    .term(row[0])
                    .reading(row[1])
                    .meaning(row[2])
                    .jlptLevel(level)
                    .category(row[3])
                    .build());
        }
        repository.saveAll(batch);
        log.info("Seeded {} từ vựng {} cho minigame", batch.size(), level);
    }

    private List<String[]> n5() {
        return List.of(
                new String[]{"学生", "がくせい", "học sinh, sinh viên", "người"},
                new String[]{"先生", "せんせい", "giáo viên", "người"},
                new String[]{"友達", "ともだち", "bạn bè", "người"},
                new String[]{"家族", "かぞく", "gia đình", "người"},
                new String[]{"会社", "かいしゃ", "công ty", "nơi chốn"},
                new String[]{"学校", "がっこう", "trường học", "nơi chốn"},
                new String[]{"病院", "びょういん", "bệnh viện", "nơi chốn"},
                new String[]{"駅", "えき", "nhà ga", "nơi chốn"},
                new String[]{"図書館", "としょかん", "thư viện", "nơi chốn"},
                new String[]{"部屋", "へや", "căn phòng", "nơi chốn"},
                new String[]{"毎日", "まいにち", "mỗi ngày", "thời gian"},
                new String[]{"今日", "きょう", "hôm nay", "thời gian"},
                new String[]{"明日", "あした", "ngày mai", "thời gian"},
                new String[]{"去年", "きょねん", "năm ngoái", "thời gian"},
                new String[]{"時間", "じかん", "thời gian, tiếng", "thời gian"},
                new String[]{"水", "みず", "nước", "đồ vật"},
                new String[]{"電車", "でんしゃ", "tàu điện", "đồ vật"},
                new String[]{"自転車", "じてんしゃ", "xe đạp", "đồ vật"},
                new String[]{"新聞", "しんぶん", "báo", "đồ vật"},
                new String[]{"切符", "きっぷ", "vé", "đồ vật"},
                new String[]{"食べる", "たべる", "ăn", "động từ"},
                new String[]{"飲む", "のむ", "uống", "động từ"},
                new String[]{"行く", "いく", "đi", "động từ"},
                new String[]{"見る", "みる", "xem, nhìn", "động từ"},
                new String[]{"話す", "はなす", "nói chuyện", "động từ"},
                new String[]{"書く", "かく", "viết", "động từ"},
                new String[]{"新しい", "あたらしい", "mới", "tính từ"},
                new String[]{"古い", "ふるい", "cũ", "tính từ"},
                new String[]{"高い", "たかい", "cao, đắt", "tính từ"},
                new String[]{"安い", "やすい", "rẻ", "tính từ"},
                new String[]{"元気", "げんき", "khoẻ mạnh", "tính từ"},
                new String[]{"静か", "しずか", "yên tĩnh", "tính từ"});
    }

    private List<String[]> n4() {
        return List.of(
                new String[]{"経験", "けいけん", "kinh nghiệm", "danh từ"},
                new String[]{"約束", "やくそく", "lời hứa, hẹn", "danh từ"},
                new String[]{"説明", "せつめい", "sự giải thích", "danh từ"},
                new String[]{"準備", "じゅんび", "sự chuẩn bị", "danh từ"},
                new String[]{"関係", "かんけい", "quan hệ", "danh từ"},
                new String[]{"生活", "せいかつ", "sinh hoạt, đời sống", "danh từ"},
                new String[]{"文化", "ぶんか", "văn hoá", "danh từ"},
                new String[]{"意見", "いけん", "ý kiến", "danh từ"},
                new String[]{"経済", "けいざい", "kinh tế", "danh từ"},
                new String[]{"社会", "しゃかい", "xã hội", "danh từ"},
                new String[]{"研究", "けんきゅう", "nghiên cứu", "danh từ"},
                new String[]{"用意", "ようい", "sự sắp sẵn", "danh từ"},
                new String[]{"習慣", "しゅうかん", "thói quen", "danh từ"},
                new String[]{"決める", "きめる", "quyết định", "động từ"},
                new String[]{"集める", "あつめる", "thu thập", "động từ"},
                new String[]{"伝える", "つたえる", "truyền đạt", "động từ"},
                new String[]{"比べる", "くらべる", "so sánh", "động từ"},
                new String[]{"続ける", "つづける", "tiếp tục", "động từ"},
                new String[]{"調べる", "しらべる", "tra cứu, điều tra", "động từ"},
                new String[]{"覚える", "おぼえる", "ghi nhớ", "động từ"},
                new String[]{"忘れる", "わすれる", "quên", "động từ"},
                new String[]{"間違える", "まちがえる", "nhầm lẫn", "động từ"},
                new String[]{"間に合う", "まにあう", "kịp giờ", "động từ"},
                new String[]{"複雑", "ふくざつ", "phức tạp", "tính từ"},
                new String[]{"簡単", "かんたん", "đơn giản", "tính từ"},
                new String[]{"大切", "たいせつ", "quan trọng", "tính từ"},
                new String[]{"必要", "ひつよう", "cần thiết", "tính từ"},
                new String[]{"危険", "きけん", "nguy hiểm", "tính từ"});
    }
}
