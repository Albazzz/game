-- V20260822_02__add_google_login.sql
-- Google Sign-In: cho phép tài khoản không có mật khẩu cục bộ + lưu google_id.
-- Schema cố tình khớp sql/schemathunghiem.sql của app J-LAS để merge không lệch.

-- Tài khoản tạo bằng Google không có password_hash.
ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(255) NULL COMMENT 'Null nếu đăng nhập qua Google';

-- MySQL 8 không có ADD COLUMN IF NOT EXISTS -> chạy 2 câu dưới một lần.
ALTER TABLE users
    ADD COLUMN login_type VARCHAR(16) NOT NULL DEFAULT 'LOCAL' AFTER password_hash,
    ADD COLUMN google_id  VARCHAR(255) NULL AFTER login_type;

-- Tra cứu theo google_id khi đăng nhập lại; NULL không bị ràng buộc unique.
CREATE UNIQUE INDEX uk_users_google_id ON users (google_id);
