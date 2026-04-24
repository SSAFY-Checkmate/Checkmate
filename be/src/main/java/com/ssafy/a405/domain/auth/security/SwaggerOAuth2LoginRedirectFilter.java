package com.ssafy.a405.domain.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class SwaggerOAuth2LoginRedirectFilter extends OncePerRequestFilter {

    private final SwaggerRedirectCookieProvider swaggerRedirectCookieProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (shouldRedirectToGoogleLogin(request)) {
            response.addHeader(HttpHeaders.SET_COOKIE, swaggerRedirectCookieProvider.createCookie().toString());
            response.sendRedirect("/oauth2/authorization/google");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldRedirectToGoogleLogin(HttpServletRequest request) {
        return isSwaggerPageRequest(request) && !hasAccessTokenCookie(request);
    }

    private boolean isSwaggerPageRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "GET".equalsIgnoreCase(request.getMethod())
                && ("/swagger-ui.html".equals(uri)
                || "/swagger-ui".equals(uri)
                || "/swagger-ui/".equals(uri)
                || "/swagger-ui/index.html".equals(uri));
    }

    private boolean hasAccessTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }

        return Arrays.stream(cookies)
                .anyMatch(cookie -> AccessTokenCookieProvider.COOKIE_NAME.equals(cookie.getName())
                        && cookie.getValue() != null
                        && !cookie.getValue().isBlank());
    }
}
