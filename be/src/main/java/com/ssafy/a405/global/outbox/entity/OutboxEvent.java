package com.ssafy.a405.global.outbox.entity;

import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Entity
@Table(
	name = "outbox_event",
	indexes = {
		@Index(name = "idx_outbox_status_created_at", columnList = "status,created_at")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboxEvent extends BaseTimeEntity {

	@Id
	@Column(name = "event_id", nullable = false, updatable = false, length = 36)
	private String eventId;

	@Column(name = "topic", nullable = false, length = 200)
	private String topic;

	@Column(name = "message_key", length = 200)
	private String messageKey;

	@Lob
	@Column(name = "payload", nullable = false, columnDefinition = "LONGTEXT")
	private String payload;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private OutboxStatus status;

	@Column(name = "attempts", nullable = false)
	private int attempts;

	@Column(name = "published_at")
	private LocalDateTime publishedAt;

	@Lob
	@Column(name = "last_error", columnDefinition = "LONGTEXT")
	private String lastError;

	public static OutboxEvent pending(String topic, String messageKey, String payload) {
		OutboxEvent event = new OutboxEvent();
		event.eventId = UUID.randomUUID().toString();
		event.topic = topic;
		event.messageKey = messageKey;
		event.payload = payload;
		event.status = OutboxStatus.PENDING;
		event.attempts = 0;
		return event;
	}

	public void markSent(LocalDateTime publishedAt) {
		this.status = OutboxStatus.SENT;
		this.publishedAt = publishedAt;
		this.lastError = null;
	}

	public void markProcessing() {
		if (this.status != OutboxStatus.PENDING) {
			return;
		}
		this.status = OutboxStatus.PROCESSING;
	}

	public void markFailed(String errorMessage, int maxAttempts) {
		this.attempts += 1;
		this.lastError = errorMessage;
		if (this.attempts >= maxAttempts) {
			this.status = OutboxStatus.DEAD;
			return;
		}
		// Allow retry on next poll.
		this.status = OutboxStatus.PENDING;
	}

	public void resetToPending() {
		this.status = OutboxStatus.PENDING;
		this.attempts = 0;
		this.publishedAt = null;
		this.lastError = null;
	}
}
