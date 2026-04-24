package com.ssafy.a405.domain.auth.security;

import com.ssafy.a405.domain.auth.dto.TokenResponse;
import com.ssafy.a405.domain.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final AccessTokenCookieProvider accessTokenCookieProvider;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;
    private final SwaggerRedirectCookieProvider swaggerRedirectCookieProvider;

    @Value("${oauth2.success-redirect-uri}")
    private String successRedirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        CustomUserDetail userDetail = (CustomUserDetail) authentication.getPrincipal();
        TokenResponse tokenResponse = authService.issueToken(userDetail);
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookieProvider.createCookie(tokenResponse.accessToken()).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieProvider.createCookie(tokenResponse.refreshToken()).toString());

        Optional<String> swaggerRedirectUri = findCookieValue(request, SwaggerRedirectCookieProvider.COOKIE_NAME);
        if (swaggerRedirectUri.isPresent()) {
            response.addHeader(HttpHeaders.SET_COOKIE, swaggerRedirectCookieProvider.deleteCookie().toString());
            response.sendRedirect(swaggerRedirectUri.get());
            return;
        }

        response.sendRedirect(successRedirectUri);
    }

    private Optional<String> findCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }
}
