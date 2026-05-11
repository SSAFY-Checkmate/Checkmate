package com.ssafy.a405.domain.inbox.entity;

import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
	name = "inbox_event",
	indexes = {
		@Index(name = "uk_inbox_consumer_event_id", columnList = "consumer,event_id", unique = true)
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InboxEvent extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "consumer", nullable = false, length = 200)
	private String consumer;

	@Column(name = "event_id", nullable = false, length = 100)
	private String eventId;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private InboxStatus status;

	@Column(name = "processed_at")
	private LocalDateTime processedAt;

	@Lob
	@Column(name = "last_error", columnDefinition = "LONGTEXT")
	private String lastError;

	public static InboxEvent received(String consumer, String eventId) {
		InboxEvent e = new InboxEvent();
		e.consumer = consumer;
		e.eventId = eventId;
		e.status = InboxStatus.RECEIVED;
		return e;
	}

	public void markProcessed(LocalDateTime processedAt) {
		this.status = InboxStatus.PROCESSED;
		this.processedAt = processedAt;
		this.lastError = null;
	}

	public void markFailed(String errorMessage) {
		this.status = InboxStatus.FAILED;
		this.lastError = errorMessage;
	}
}

