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
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (shouldRedirectToGoogleLogin(request)) {
            String prefix = resolveExternalPrefix(request);
            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    swaggerRedirectCookieProvider.createCookie(prefix + "/swagger-ui/index.html").toString()
            );
            response.sendRedirect(prefix + "/oauth2/authorization/google");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldRedirectToGoogleLogin(HttpServletRequest request) {
        return isSwaggerPageRequest(request) && !hasValidAccessToken(request);
    }

    private boolean isSwaggerPageRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String swaggerSuffix = resolveSwaggerSuffix(uri);
        if (swaggerSuffix == null) {
            return false;
        }

        return "/swagger-ui.html".equals(swaggerSuffix)
                || "/swagger-ui".equals(swaggerSuffix)
                || "/swagger-ui/".equals(swaggerSuffix)
                || "/swagger-ui/index.html".equals(swaggerSuffix);
    }

    private boolean hasValidAccessToken(HttpServletRequest request) {
        String token = resolveAccessTokenCookieValue(request);
        if (token == null) {
            return false;
        }

        try {
            jwtTokenProvider.parseClaims(token);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private String resolveAccessTokenCookieValue(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> AccessTokenCookieProvider.COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String resolveExternalPrefix(HttpServletRequest request) {
        String forwardedPrefix = request.getHeader("X-Forwarded-Prefix");
        if (forwardedPrefix != null && !forwardedPrefix.isBlank()) {
            String normalized = forwardedPrefix.trim();
            if (!normalized.startsWith("/")) {
                normalized = "/" + normalized;
            }
            if (normalized.endsWith("/")) {
                normalized = normalized.substring(0, normalized.length() - 1);
            }
            return normalized.equals("/") ? "" : normalized;
        }

        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && !"/".equals(contextPath)) {
            return contextPath.endsWith("/") ? contextPath.substring(0, contextPath.length() - 1) : contextPath;
        }

        String uri = request.getRequestURI();
        String swaggerSuffix = resolveSwaggerSuffix(uri);
        if (swaggerSuffix == null) {
            return "";
        }

        int idx = uri.lastIndexOf(swaggerSuffix);
        if (idx <= 0) {
            return "";
        }

        return uri.substring(0, idx);
    }

    private String resolveSwaggerSuffix(String uri) {
        if (uri == null) {
            return null;
        }

        if (uri.startsWith("/swagger-ui") || "/swagger-ui.html".equals(uri)) {
            return uri;
        }

        int idx = uri.lastIndexOf("/swagger-ui");
        if (idx < 0) {
            return null;
        }

        return uri.substring(idx);
    }
}
