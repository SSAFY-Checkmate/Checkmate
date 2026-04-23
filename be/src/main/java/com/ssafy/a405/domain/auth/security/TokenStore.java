package com.ssafy.a405.domain.auth.security;

import java.time.Duration;
import java.util.Optional;

public interface TokenStore {

    void saveRefreshToken(Long userId, String refreshToken, Duration ttl);

    Optional<String> getRefreshToken(Long userId);

    void deleteRefreshToken(Long userId);
}
