package com.ssafy.a405.domain.auth.security;

import com.ssafy.a405.domain.auth.dto.TokenResponse;
import com.ssafy.a405.domain.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final String SWAGGER_ACCESS_TOKEN_STORAGE_KEY = "swagger_access_token";

    private final AuthService authService;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;

    @Value("${oauth2.success-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String successRedirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        CustomUserDetail userDetail = (CustomUserDetail) authentication.getPrincipal();
        TokenResponse tokenResponse = authService.issueToken(userDetail);
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieProvider.createCookie(tokenResponse.refreshToken()).toString());

        Optional<String> swaggerRedirectUri = getCookieValue(request, CustomAuthenticationEntryPoint.SWAGGER_REDIRECT_COOKIE_NAME);
        if (swaggerRedirectUri.isPresent()) {
            response.addHeader(HttpHeaders.SET_COOKIE, deleteSwaggerRedirectCookie().toString());
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().write(swaggerRedirectHtml(tokenResponse.accessToken(), swaggerRedirectUri.get()));
            return;
        }

        String redirectUri = UriComponentsBuilder.fromUriString(successRedirectUri)
                .queryParam("accessToken", tokenResponse.accessToken())
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        response.sendRedirect(redirectUri);
    }

    private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private ResponseCookie deleteSwaggerRedirectCookie() {
        return ResponseCookie.from(CustomAuthenticationEntryPoint.SWAGGER_REDIRECT_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ZERO)
                .build();
    }

    private String swaggerRedirectHtml(String accessToken, String redirectUri) {
        String escapedAccessToken = accessToken.replace("\\", "\\\\").replace("'", "\\'");
        String escapedRedirectUri = redirectUri.replace("\\", "\\\\").replace("'", "\\'");

        return """
                <!doctype html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>Swagger Login</title>
                </head>
                <body>
                <script>
                    sessionStorage.setItem('%s', '%s');
                    location.replace('%s');
                </script>
                </body>
                </html>
                """.formatted(SWAGGER_ACCESS_TOKEN_STORAGE_KEY, escapedAccessToken, escapedRedirectUri);
    }
}
