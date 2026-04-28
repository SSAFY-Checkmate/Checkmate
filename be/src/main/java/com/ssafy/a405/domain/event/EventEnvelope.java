package com.ssafy.a405.domain.event;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

/**
 * Minimal event envelope for Kafka messages.
 *
 * Keep this stable; add new fields only in a backward-compatible way.
 */
public record EventEnvelope(
	String eventId,
	String eventType,
	int eventVersion,
	Instant occurredAt,
	String traceId,
	String aggregateId,
	JsonNode payload
) {
}

