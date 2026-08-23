package admin.jlas.game.modules.auth.security;

import admin.jlas.game.common.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Trả JSON 401 cho /api/**, redirect sang /login cho request trang HTML. */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String uri = request.getRequestURI();
        boolean wantsJson = uri.startsWith("/api/")
                || MediaType.APPLICATION_JSON_VALUE.equals(request.getHeader("Accept"));

        if (wantsJson) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(),
                    ApiResponse.fail("Vui lòng đăng nhập để tiếp tục"));
            return;
        }

        String target = request.getRequestURI();
        if (request.getQueryString() != null) {
            target = target + "?" + request.getQueryString();
        }
        response.sendRedirect("/login?redirect=" + java.net.URLEncoder.encode(target,
                java.nio.charset.StandardCharsets.UTF_8));
    }
}
