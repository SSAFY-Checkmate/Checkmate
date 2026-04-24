package com.ssafy.a405.domain.analysis.dto;

/**
 * Parser worker should store transcript JSON to Redis and publish only a reference.
 */
public record TranscriptCompletedPayload(
	String jobId,
	String artifactKey,
	Integer ttlSeconds,
	String hash
) {
}

