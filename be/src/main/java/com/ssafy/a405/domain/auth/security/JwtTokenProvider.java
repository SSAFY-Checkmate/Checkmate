package com.ssafy.a405.domain.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final SecretKey key;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.key = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(CustomUserDetail userDetail) {
        return createToken(userDetail, jwtProperties.accessTokenExpirationMillis());
    }

    public String createRefreshToken(CustomUserDetail userDetail) {
        return createToken(userDetail, jwtProperties.refreshTokenExpirationMillis());
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    private String createToken(CustomUserDetail userDetail, long expirationMillis) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(String.valueOf(userDetail.getUserId()))
                .claim("email", userDetail.getEmail())
                .claim("name", userDetail.getDisplayName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }
}
