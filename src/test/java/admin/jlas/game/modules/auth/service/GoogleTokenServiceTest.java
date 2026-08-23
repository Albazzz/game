package admin.jlas.game.modules.auth.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.AppProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Cờ bật/tắt Google login — thuần logic, không gọi mạng. */
class GoogleTokenServiceTest {

    private GoogleTokenService serviceWithClientId(String clientId) {
        AppProperties properties = new AppProperties();
        properties.getGoogle().setClientId(clientId);
        return new GoogleTokenService(properties);
    }

    @Test
    @DisplayName("Chưa cấu hình client id -> Google login tắt")
    void clientIdRongThiGoogleLoginTat() {
        assertFalse(serviceWithClientId("").isEnabled());
    }

    @Test
    @DisplayName("Client id còn placeholder -> Google login tắt")
    void clientIdPlaceholderThiGoogleLoginTat() {
        assertFalse(serviceWithClientId("your-google-client-id").isEnabled());
    }

    @Test
    @DisplayName("Client id thật -> Google login bật")
    void clientIdThatThiGoogleLoginBat() {
        assertTrue(serviceWithClientId("123-abc.apps.googleusercontent.com").isEnabled());
    }

    @Test
    @DisplayName("Gọi verify khi chưa cấu hình -> GOOGLE_LOGIN_DISABLED, không gọi mạng")
    void verifyKhiChuaCauHinhThiTraLoiGoogleLoginDisabled() {
        GoogleTokenService service = serviceWithClientId("");
        ApiException ex = assertThrows(ApiException.class, () -> service.verifyIdToken("bat-ky"));
        assertEquals(ErrorCode.GOOGLE_LOGIN_DISABLED, ex.getErrorCode());
    }
}
