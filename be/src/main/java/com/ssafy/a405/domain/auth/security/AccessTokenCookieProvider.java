package com.ssafy.a405.domain.auth.security;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AccessTokenCookieProvider {

    public static final String COOKIE_NAME = "accessToken";

    private final JwtProperties jwtProperties;

    public AccessTokenCookieProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public ResponseCookie createCookie(String accessToken) {
        return ResponseCookie.from(COOKIE_NAME, accessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofMillis(jwtProperties.accessTokenExpirationMillis()))
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
