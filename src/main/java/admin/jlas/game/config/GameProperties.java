package admin.jlas.game.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Cấu hình runtime của Game Arena (countdown, grace period, rate limit...). */
@ConfigurationProperties(prefix = "game")
public class GameProperties {

    private final Arena arena = new Arena();
    private final Memory memory = new Memory();
    private final AirDefense airDefense = new AirDefense();
    private final Demo demo = new Demo();

    public Arena getArena() {
        return arena;
    }

    public Memory getMemory() {
        return memory;
    }

    public AirDefense getAirDefense() {
        return airDefense;
    }

    public Demo getDemo() {
        return demo;
    }

    public static class Arena {
        private int countdownSeconds = 3;
        private int reconnectGraceSeconds = 25;
        private int roomIdleTimeoutMinutes = 30;
        private int maxRooms = 5000;
        private long sweepIntervalMs = 15_000L;
        private int maxWsPayloadBytes = 8192;
        private final RateLimit rateLimit = new RateLimit();

        public int getCountdownSeconds() {
            return countdownSeconds;
        }

        public void setCountdownSeconds(int countdownSeconds) {
            this.countdownSeconds = countdownSeconds;
        }

        public int getReconnectGraceSeconds() {
            return reconnectGraceSeconds;
        }

        public void setReconnectGraceSeconds(int reconnectGraceSeconds) {
            this.reconnectGraceSeconds = reconnectGraceSeconds;
        }

        public int getRoomIdleTimeoutMinutes() {
            return roomIdleTimeoutMinutes;
        }

        public void setRoomIdleTimeoutMinutes(int roomIdleTimeoutMinutes) {
            this.roomIdleTimeoutMinutes = roomIdleTimeoutMinutes;
        }

        public int getMaxRooms() {
            return maxRooms;
        }

        public void setMaxRooms(int maxRooms) {
            this.maxRooms = maxRooms;
        }

        public long getSweepIntervalMs() {
            return sweepIntervalMs;
        }

        public void setSweepIntervalMs(long sweepIntervalMs) {
            this.sweepIntervalMs = sweepIntervalMs;
        }

        public int getMaxWsPayloadBytes() {
            return maxWsPayloadBytes;
        }

        public void setMaxWsPayloadBytes(int maxWsPayloadBytes) {
            this.maxWsPayloadBytes = maxWsPayloadBytes;
        }

        public RateLimit getRateLimit() {
            return rateLimit;
        }
    }

    public static class RateLimit {
        private int readyPerMinute = 40;
        private int settingsPerMinute = 60;
        private int startPerMinute = 15;
        private int joinPerMinute = 30;
        /** Flip nhanh nhất của người chơi thật vẫn dưới ngưỡng này. */
        private int flipPerMinute = 120;
        private int answerPerMinute = 180;

        public int getAnswerPerMinute() {
            return answerPerMinute;
        }

        public void setAnswerPerMinute(int answerPerMinute) {
            this.answerPerMinute = answerPerMinute;
        }

        public int getFlipPerMinute() {
            return flipPerMinute;
        }

        public void setFlipPerMinute(int flipPerMinute) {
            this.flipPerMinute = flipPerMinute;
        }

        public int getReadyPerMinute() {
            return readyPerMinute;
        }

        public void setReadyPerMinute(int readyPerMinute) {
            this.readyPerMinute = readyPerMinute;
        }

        public int getSettingsPerMinute() {
            return settingsPerMinute;
        }

        public void setSettingsPerMinute(int settingsPerMinute) {
            this.settingsPerMinute = settingsPerMinute;
        }

        public int getStartPerMinute() {
            return startPerMinute;
        }

        public void setStartPerMinute(int startPerMinute) {
            this.startPerMinute = startPerMinute;
        }

        public int getJoinPerMinute() {
            return joinPerMinute;
        }

        public void setJoinPerMinute(int joinPerMinute) {
            this.joinPerMinute = joinPerMinute;
        }
    }

    public static class Memory {
        /** Thời gian hiển thị cặp sai trước khi úp lại. */
        private int revealDelayMs = 900;
        /** Session đã kết thúc/không hoạt động bị dọn sau ngưỡng này. */
        private int sessionIdleTimeoutMinutes = 20;
        private int maxSessions = 5000;

        public int getRevealDelayMs() {
            return revealDelayMs;
        }

        public void setRevealDelayMs(int revealDelayMs) {
            this.revealDelayMs = revealDelayMs;
        }

        public int getSessionIdleTimeoutMinutes() {
            return sessionIdleTimeoutMinutes;
        }

        public void setSessionIdleTimeoutMinutes(int sessionIdleTimeoutMinutes) {
            this.sessionIdleTimeoutMinutes = sessionIdleTimeoutMinutes;
        }

        public int getMaxSessions() {
            return maxSessions;
        }

        public void setMaxSessions(int maxSessions) {
            this.maxSessions = maxSessions;
        }
    }

    public static class AirDefense {
        private int sessionIdleTimeoutMinutes = 20;
        private int maxSessions = 5000;

        public int getSessionIdleTimeoutMinutes() {
            return sessionIdleTimeoutMinutes;
        }

        public void setSessionIdleTimeoutMinutes(int sessionIdleTimeoutMinutes) {
            this.sessionIdleTimeoutMinutes = sessionIdleTimeoutMinutes;
        }

        public int getMaxSessions() {
            return maxSessions;
        }

        public void setMaxSessions(int maxSessions) {
            this.maxSessions = maxSessions;
        }
    }

    public static class Demo {
        private boolean seedEnabled = true;
        private String password = "demo1234";
        private String adminEmail = "admin@jlas.local";
        private String adminPassword = "admin1234";

        public boolean isSeedEnabled() {
            return seedEnabled;
        }

        public void setSeedEnabled(boolean seedEnabled) {
            this.seedEnabled = seedEnabled;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getAdminEmail() {
            return adminEmail;
        }

        public void setAdminEmail(String adminEmail) {
            this.adminEmail = adminEmail;
        }

        public String getAdminPassword() {
            return adminPassword;
        }

        public void setAdminPassword(String adminPassword) {
            this.adminPassword = adminPassword;
        }
    }
}
