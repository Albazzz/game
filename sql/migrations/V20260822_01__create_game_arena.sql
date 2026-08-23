-- V20260822_01__create_game_arena.sql
-- Game Arena phase 1: roles + users (demo) + game_match/game_match_player.
-- Room ở trạng thái chờ giữ trong bộ nhớ server, KHÔNG persist.
-- Khi merge vào app J-LAS: bỏ phần roles/users, module game dùng bảng hiện có
-- (schema roles/users dưới đây cố tình khớp với sql/schema_full.sql của J-LAS).

CREATE TABLE IF NOT EXISTS roles (
    role_id     BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255) NULL,
    PRIMARY KEY (role_id),
    UNIQUE KEY uk_roles_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    user_id       BIGINT       NOT NULL AUTO_INCREMENT,
    role_id       BIGINT       NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL COMMENT 'Null nếu đăng nhập qua Google',
    login_type    VARCHAR(16)  NOT NULL DEFAULT 'LOCAL',
    google_id     VARCHAR(255) NULL,
    full_name     VARCHAR(150) NULL,
    avatar        VARCHAR(500) NULL,
    is_ban        TINYINT(1)   NOT NULL DEFAULT 0,
    created_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY idx_users_email (email),
    UNIQUE KEY uk_users_google_id (google_id),
    KEY idx_users_role (role_id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Role seed: DataInitializer cũng seed khi boot, câu lệnh dưới để chạy migration thuần SQL.
INSERT INTO roles (name, description) VALUES
    ('USER', 'Default learner role'),
    ('PREMIUM', 'Premium subscriber role'),
    ('MODERATOR', 'Content moderator role'),
    ('ADMIN', 'Administrator role'),
    ('SUPER_ADMIN', 'Super administrator role')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Backfill user cũ (trước khi có bảng roles) về USER.
UPDATE users u
JOIN roles r ON r.name = 'USER'
SET u.role_id = r.role_id
WHERE u.role_id IS NULL;

CREATE TABLE IF NOT EXISTS game_match (
    match_id          BIGINT      NOT NULL AUTO_INCREMENT,
    room_id           VARCHAR(64) NOT NULL,
    room_code         VARCHAR(16) NOT NULL,
    game_type         VARCHAR(32) NOT NULL,
    status            VARCHAR(16) NOT NULL,
    started_at        DATETIME(6) NOT NULL,
    ended_at          DATETIME(6) NULL,
    winner_user_id    BIGINT      NULL,
    winner_team       INT         NULL,
    settings_snapshot TEXT        NULL,
    PRIMARY KEY (match_id),
    KEY idx_game_match_room_code (room_code),
    KEY idx_game_match_started_at (started_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_match_player (
    match_player_id BIGINT       NOT NULL AUTO_INCREMENT,
    match_id        BIGINT       NOT NULL,
    user_id         BIGINT       NOT NULL,
    display_name    VARCHAR(150) NOT NULL,
    slot            INT          NOT NULL,
    team            INT          NULL,
    score           INT          NOT NULL DEFAULT 0,
    result          VARCHAR(16)  NOT NULL DEFAULT 'PENDING',
    joined_at       DATETIME(6)  NOT NULL,
    disconnected    TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (match_player_id),
    UNIQUE KEY uk_match_player (match_id, user_id),
    KEY idx_match_player_user (user_id),
    CONSTRAINT fk_match_player_match FOREIGN KEY (match_id)
        REFERENCES game_match (match_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
