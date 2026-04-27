package com.ssafy.a405.domain.auth.security;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class SwaggerRedirectCookieProvider {

    public static final String COOKIE_NAME = "swagger_redirect";

    public ResponseCookie createCookie(String swaggerRedirectUri) {
        return ResponseCookie.from(COOKIE_NAME, swaggerRedirectUri)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofMinutes(3))
                .build();
    }

    public ResponseCookie deleteCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ZERO)
                .build();
    }
}
