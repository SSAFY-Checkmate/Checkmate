package com.ssafy.a405.domain.analysis.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AnalysisJobReadCache {

	private static final String KEY_PREFIX = "analysis:job:";

	private final StringRedisTemplate redisTemplate;
	private final ObjectMapper objectMapper;

	public Optional<AnalysisJobGetResponse> get(String jobId) {
		String raw = redisTemplate.opsForValue().get(key(jobId));
		if (raw == null || raw.isBlank()) {
			return Optional.empty();
		}
		try {
			return Optional.of(objectMapper.readValue(raw, AnalysisJobGetResponse.class));
		} catch (Exception ignored) {
			// If cache payload is invalid/outdated, ignore and fall back to DB.
			return Optional.empty();
		}
	}

	public void put(String jobId, AnalysisJobGetResponse value, Duration ttl) {
		try {
			String raw = objectMapper.writeValueAsString(value);
			redisTemplate.opsForValue().set(key(jobId), raw, ttl);
		} catch (Exception ignored) {
			// Cache failures should not break API responses.
		}
	}

	public void evict(String jobId) {
		redisTemplate.delete(key(jobId));
	}

	private String key(String jobId) {
		return KEY_PREFIX + jobId;
	}
}

