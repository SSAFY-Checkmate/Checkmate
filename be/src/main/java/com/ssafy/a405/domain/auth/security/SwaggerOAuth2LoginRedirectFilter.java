package com.ssafy.a405.domain.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;

@Component
public class SwaggerOAuth2LoginRedirectFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (shouldRedirectToGoogleLogin(request)) {
            ResponseCookie redirectCookie = ResponseCookie.from(
                            CustomAuthenticationEntryPoint.SWAGGER_REDIRECT_COOKIE_NAME,
                            normalizeSwaggerUri(request)
                    )
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .sameSite("None")
                    .maxAge(Duration.ofMinutes(3))
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, redirectCookie.toString());
            response.sendRedirect("/oauth2/authorization/google");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldRedirectToGoogleLogin(HttpServletRequest request) {
        return isSwaggerPageRequest(request) && !hasRefreshTokenCookie(request);
    }

    private boolean isSwaggerPageRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "GET".equalsIgnoreCase(request.getMethod())
                && ("/swagger-ui.html".equals(uri)
                || "/swagger-ui".equals(uri)
                || "/swagger-ui/".equals(uri)
                || "/swagger-ui/index.html".equals(uri));
    }

    private boolean hasRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }

        return Arrays.stream(cookies)
                .anyMatch(cookie -> RefreshTokenCookieProvider.COOKIE_NAME.equals(cookie.getName())
                        && cookie.getValue() != null
                        && !cookie.getValue().isBlank());
    }

    private String normalizeSwaggerUri(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "/swagger-ui.html".equals(uri) || "/swagger-ui".equals(uri) || "/swagger-ui/".equals(uri)
                ? "/swagger-ui/index.html"
                : uri;
    }
}
