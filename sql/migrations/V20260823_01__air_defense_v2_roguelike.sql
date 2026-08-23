-- Air Defence Edition 2.0: Roguelike & Out-of-game Economy (Tàu chiến & Permanent Talent Tree)

CREATE TABLE IF NOT EXISTS air_defense_spaceships (
    ship_id             VARCHAR(64)  NOT NULL,
    name                VARCHAR(128) NOT NULL,
    role                VARCHAR(32)  NOT NULL DEFAULT 'BALANCED',
    description         TEXT         NULL,
    price_coins         INT          NOT NULL DEFAULT 0,
    base_hp             INT          NOT NULL DEFAULT 100,
    speed_mult          DOUBLE       NOT NULL DEFAULT 1.0,
    passive_skill_code  VARCHAR(64)  NULL,
    color_theme         VARCHAR(32)  NOT NULL DEFAULT 'cyan',
    created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (ship_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_spaceships (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    user_id             BIGINT       NOT NULL,
    ship_id             VARCHAR(64)  NOT NULL,
    purchased_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_ship (user_id, ship_id),
    KEY idx_user_ship_user (user_id),
    CONSTRAINT fk_user_ship_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_ship_def FOREIGN KEY (ship_id) REFERENCES air_defense_spaceships (ship_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_permanent_upgrades (
    user_id             BIGINT       NOT NULL,
    coins_balance       INT          NOT NULL DEFAULT 0,
    extra_base_hp_level INT          NOT NULL DEFAULT 0,
    coin_bonus_level    INT          NOT NULL DEFAULT 0,
    reroll_count_level  INT          NOT NULL DEFAULT 0,
    fast_start_level    INT          NOT NULL DEFAULT 0,
    equipped_ship_id    VARCHAR(64)  NOT NULL DEFAULT 'NOVA-01',
    updated_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id),
    CONSTRAINT fk_user_upgrade_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Dữ liệu mẫu Tàu chiến
INSERT INTO air_defense_spaceships (ship_id, name, role, description, price_coins, base_hp, speed_mult, passive_skill_code, color_theme)
VALUES 
('NOVA-01', 'Vanguard Alpha (Nova-01)', 'BALANCED', 'Tàu chiến tân thủ tiêu chuẩn, cân bằng và ổn định.', 0, 100, 1.0, NULL, 'cyan'),
('FROSTBYTE', 'Frostbyte Sentinel', 'CONTROL', 'Mỗi khi gõ đúng 5 từ liên tiếp, tự động đóng băng toàn bộ quái vật trong 2 giây.', 800, 120, 0.8, 'PASSIVE_FROST_FREEZE', 'cyan'),
('RAPTOR-7', 'Hyperion Phantom (Raptor-7)', 'VELOCITY', 'Nhận thêm +100% điểm Combo khi tốc độ gõ trên 1.5 từ/giây.', 1200, 80, 1.4, 'PASSIVE_HYPER_SPEED', 'violet'),
('AEGIS-01', 'Aegis Defender', 'FORTRESS', 'Giảm 30% sát thương va chạm khi quái vật tiếp cận phòng tuyến.', 1500, 180, 0.7, 'PASSIVE_AEGIS_SHIELD', 'amber')
ON DUPLICATE KEY UPDATE name=VALUES(name);
