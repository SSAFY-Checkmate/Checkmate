package com.ssafy.a405.domain.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RedisTokenStore implements TokenStore {

    private static final String REFRESH_TOKEN_KEY_PREFIX = "auth:refresh:";

    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveRefreshToken(Long userId, String refreshToken, Duration ttl) {
        redisTemplate.opsForValue().set(key(userId), refreshToken, ttl);
    }

    @Override
    public Optional<String> getRefreshToken(Long userId) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(key(userId)));
    }

    @Override
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete(key(userId));
    }

    private String key(Long userId) {
        return REFRESH_TOKEN_KEY_PREFIX + userId;
    }
}
