-- V20260822_03__create_memory_match.sql
-- Phase 2A: nguồn từ vựng cho minigame + bảng kết quả Memory Match.
-- game_vocabulary là bảng RIÊNG của module game: khi merge vào app J-LAS chỉ cần
-- thay GameVocabularyRepository bằng adapter đọc bảng vocabulary thật (rule.md §5).

CREATE TABLE IF NOT EXISTS game_vocabulary (
    vocab_id   BIGINT       NOT NULL AUTO_INCREMENT,
    term       VARCHAR(100) NOT NULL COMMENT 'Kanji hoặc dạng viết của từ',
    reading    VARCHAR(150) NOT NULL COMMENT 'Hiragana/Katakana',
    meaning    VARCHAR(255) NOT NULL COMMENT 'Nghĩa tiếng Việt',
    jlpt_level VARCHAR(10)  NOT NULL,
    category   VARCHAR(60)  NULL,
    PRIMARY KEY (vocab_id),
    UNIQUE KEY uk_game_vocab_term (term, reading),
    KEY idx_game_vocab_level (jlpt_level)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS memory_match_result (
    result_id           BIGINT      NOT NULL AUTO_INCREMENT,
    session_id          VARCHAR(64) NOT NULL,
    match_id            BIGINT      NULL COMMENT 'Null với solo (không qua phòng)',
    room_id             VARCHAR(64) NULL,
    user_id             BIGINT      NOT NULL,
    play_mode           VARCHAR(16) NOT NULL,
    objective           VARCHAR(16) NOT NULL,
    pair_mode           VARCHAR(32) NOT NULL,
    jlpt_level          VARCHAR(10) NOT NULL,
    outcome             VARCHAR(20) NOT NULL,
    board_size          INT         NOT NULL,
    pairs_found         INT         NOT NULL DEFAULT 0,
    mistakes            INT         NOT NULL DEFAULT 0,
    moves               INT         NOT NULL DEFAULT 0,
    best_streak         INT         NOT NULL DEFAULT 0,
    accuracy_percent    INT         NULL,
    average_decision_ms INT         NULL,
    duration_ms         BIGINT      NOT NULL DEFAULT 0,
    ranked              TINYINT(1)  NOT NULL DEFAULT 0,
    winner              TINYINT(1)  NOT NULL DEFAULT 0,
    finished_at         DATETIME(6) NOT NULL,
    PRIMARY KEY (result_id),
    UNIQUE KEY uk_memory_result_session_user (session_id, user_id),
    KEY idx_memory_result_user (user_id),
    KEY idx_memory_result_session (session_id),
    KEY idx_memory_result_finished (finished_at),
    CONSTRAINT fk_memory_result_match FOREIGN KEY (match_id)
        REFERENCES game_match (match_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Seed từ vựng N5/N4. Bàn lớn nhất là 40 thẻ = 20 cặp, nên mỗi level cần >= 20 từ.
INSERT INTO game_vocabulary (term, reading, meaning, jlpt_level, category) VALUES
    ('学生', 'がくせい', 'học sinh, sinh viên', 'N5', 'người'),
    ('先生', 'せんせい', 'giáo viên', 'N5', 'người'),
    ('友達', 'ともだち', 'bạn bè', 'N5', 'người'),
    ('家族', 'かぞく', 'gia đình', 'N5', 'người'),
    ('会社', 'かいしゃ', 'công ty', 'N5', 'nơi chốn'),
    ('学校', 'がっこう', 'trường học', 'N5', 'nơi chốn'),
    ('病院', 'びょういん', 'bệnh viện', 'N5', 'nơi chốn'),
    ('駅', 'えき', 'nhà ga', 'N5', 'nơi chốn'),
    ('図書館', 'としょかん', 'thư viện', 'N5', 'nơi chốn'),
    ('部屋', 'へや', 'căn phòng', 'N5', 'nơi chốn'),
    ('毎日', 'まいにち', 'mỗi ngày', 'N5', 'thời gian'),
    ('今日', 'きょう', 'hôm nay', 'N5', 'thời gian'),
    ('明日', 'あした', 'ngày mai', 'N5', 'thời gian'),
    ('去年', 'きょねん', 'năm ngoái', 'N5', 'thời gian'),
    ('時間', 'じかん', 'thời gian, tiếng', 'N5', 'thời gian'),
    ('水', 'みず', 'nước', 'N5', 'đồ vật'),
    ('電車', 'でんしゃ', 'tàu điện', 'N5', 'đồ vật'),
    ('自転車', 'じてんしゃ', 'xe đạp', 'N5', 'đồ vật'),
    ('新聞', 'しんぶん', 'báo', 'N5', 'đồ vật'),
    ('切符', 'きっぷ', 'vé', 'N5', 'đồ vật'),
    ('食べる', 'たべる', 'ăn', 'N5', 'động từ'),
    ('飲む', 'のむ', 'uống', 'N5', 'động từ'),
    ('行く', 'いく', 'đi', 'N5', 'động từ'),
    ('見る', 'みる', 'xem, nhìn', 'N5', 'động từ'),
    ('話す', 'はなす', 'nói chuyện', 'N5', 'động từ'),
    ('書く', 'かく', 'viết', 'N5', 'động từ'),
    ('新しい', 'あたらしい', 'mới', 'N5', 'tính từ'),
    ('古い', 'ふるい', 'cũ', 'N5', 'tính từ'),
    ('高い', 'たかい', 'cao, đắt', 'N5', 'tính từ'),
    ('安い', 'やすい', 'rẻ', 'N5', 'tính từ'),
    ('元気', 'げんき', 'khoẻ mạnh', 'N5', 'tính từ'),
    ('静か', 'しずか', 'yên tĩnh', 'N5', 'tính từ')
ON DUPLICATE KEY UPDATE meaning = VALUES(meaning), jlpt_level = VALUES(jlpt_level);

INSERT INTO game_vocabulary (term, reading, meaning, jlpt_level, category) VALUES
    ('経験', 'けいけん', 'kinh nghiệm', 'N4', 'danh từ'),
    ('約束', 'やくそく', 'lời hứa, hẹn', 'N4', 'danh từ'),
    ('説明', 'せつめい', 'sự giải thích', 'N4', 'danh từ'),
    ('準備', 'じゅんび', 'sự chuẩn bị', 'N4', 'danh từ'),
    ('関係', 'かんけい', 'quan hệ', 'N4', 'danh từ'),
    ('生活', 'せいかつ', 'sinh hoạt, đời sống', 'N4', 'danh từ'),
    ('文化', 'ぶんか', 'văn hoá', 'N4', 'danh từ'),
    ('意見', 'いけん', 'ý kiến', 'N4', 'danh từ'),
    ('経済', 'けいざい', 'kinh tế', 'N4', 'danh từ'),
    ('社会', 'しゃかい', 'xã hội', 'N4', 'danh từ'),
    ('研究', 'けんきゅう', 'nghiên cứu', 'N4', 'danh từ'),
    ('用意', 'ようい', 'sự sắp sẵn', 'N4', 'danh từ'),
    ('習慣', 'しゅうかん', 'thói quen', 'N4', 'danh từ'),
    ('決める', 'きめる', 'quyết định', 'N4', 'động từ'),
    ('集める', 'あつめる', 'thu thập', 'N4', 'động từ'),
    ('伝える', 'つたえる', 'truyền đạt', 'N4', 'động từ'),
    ('比べる', 'くらべる', 'so sánh', 'N4', 'động từ'),
    ('続ける', 'つづける', 'tiếp tục', 'N4', 'động từ'),
    ('調べる', 'しらべる', 'tra cứu, điều tra', 'N4', 'động từ'),
    ('覚える', 'おぼえる', 'ghi nhớ', 'N4', 'động từ'),
    ('忘れる', 'わすれる', 'quên', 'N4', 'động từ'),
    ('間違える', 'まちがえる', 'nhầm lẫn', 'N4', 'động từ'),
    ('間に合う', 'まにあう', 'kịp giờ', 'N4', 'động từ'),
    ('複雑', 'ふくざつ', 'phức tạp', 'N4', 'tính từ'),
    ('簡単', 'かんたん', 'đơn giản', 'N4', 'tính từ'),
    ('大切', 'たいせつ', 'quan trọng', 'N4', 'tính từ'),
    ('必要', 'ひつよう', 'cần thiết', 'N4', 'tính từ'),
    ('危険', 'きけん', 'nguy hiểm', 'N4', 'tính từ')
ON DUPLICATE KEY UPDATE meaning = VALUES(meaning), jlpt_level = VALUES(jlpt_level);
