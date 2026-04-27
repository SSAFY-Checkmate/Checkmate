package com.ssafy.a405.global.outbox.dto;

import com.ssafy.a405.global.outbox.entity.OutboxEvent;
import com.ssafy.a405.global.outbox.entity.OutboxStatus;

import java.time.LocalDateTime;

public record OutboxEventResponse(
	String eventId,
	String topic,
	String messageKey,
	OutboxStatus status,
	int attempts,
	LocalDateTime createdAt,
	LocalDateTime publishedAt,
	String lastError
) {
	public static OutboxEventResponse from(OutboxEvent e) {
		return new OutboxEventResponse(
			e.getEventId(),
			e.getTopic(),
			e.getMessageKey(),
			e.getStatus(),
			e.getAttempts(),
			e.getCreatedAt(),
			e.getPublishedAt(),
			e.getLastError()
		);
	}
}

