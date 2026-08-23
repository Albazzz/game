package admin.jlas.game.modules.auth.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.config.AppProperties;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;

/**
 * Verify Google ID token (Google Identity Services) — port từ app J-LAS.
 * Chữ ký, issuer và audience đều do thư viện Google kiểm tra; server không
 * bao giờ tin dữ liệu email/name do client tự gửi.
 */
@Service
@RequiredArgsConstructor
public class GoogleTokenService {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenService.class);

    private final AppProperties appProperties;

    /** Google login chỉ bật khi đã cấu hình client id thật. */
    public boolean isEnabled() {
        String clientId = appProperties.getGoogle().getClientId();
        return StringUtils.hasText(clientId) && !clientId.contains("your-google-client-id");
    }

    public GoogleUserInfo verifyIdToken(String idTokenString) {
        if (!isEnabled()) {
            throw new ApiException(ErrorCode.GOOGLE_LOGIN_DISABLED);
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(appProperties.getGoogle().getClientId()))
                    .build();
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ApiException(ErrorCode.GOOGLE_AUTH_FAILED, "Invalid Google ID token");
            }
            Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new ApiException(ErrorCode.GOOGLE_AUTH_FAILED, "Google email is not verified");
            }
            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("name"),
                    (String) payload.get("picture"));
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Google token verification failed: {}", ex.getMessage());
            throw new ApiException(ErrorCode.GOOGLE_AUTH_FAILED, "Google authentication failed");
        }
    }

    public record GoogleUserInfo(String googleId, String email, String fullName, String avatar) {
    }
}
