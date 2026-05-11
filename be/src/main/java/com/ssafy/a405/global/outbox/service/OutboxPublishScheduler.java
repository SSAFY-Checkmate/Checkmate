package com.ssafy.a405.global.outbox.service;

import com.ssafy.a405.global.outbox.entity.OutboxEvent;
import com.ssafy.a405.global.outbox.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.event.EventEnvelope;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@ConditionalOnProperty(name = "outbox.publisher.enabled", havingValue = "true", matchIfMissing = false)
public class OutboxPublishScheduler {

	private final OutboxEventRepository outboxEventRepository;
	private final KafkaTemplate<String, String> kafkaTemplate;
	private final ObjectMapper objectMapper;
	private final TransactionTemplate tx;

	@Value("${outbox.publisher.batch-size:50}")
	private int batchSize;

	@Value("${outbox.publisher.max-attempts:10}")
	private int maxAttempts;

	@Value("${outbox.publisher.send-timeout-ms:5000}")
	private long sendTimeoutMs;

	@Value("${outbox.publisher.processing-timeout-seconds:60}")
	private long processingTimeoutSeconds;

	public OutboxPublishScheduler(
		OutboxEventRepository outboxEventRepository,
		KafkaTemplate<String, String> kafkaTemplate,
		ObjectMapper objectMapper,
		PlatformTransactionManager transactionManager
	) {
		this.outboxEventRepository = outboxEventRepository;
		this.kafkaTemplate = kafkaTemplate;
		this.objectMapper = objectMapper;
		this.tx = new TransactionTemplate(transactionManager);
	}

	/**
	 * Note:
	 * - This is a basic skeleton. If you run multiple BE instances, use a distributed lock (e.g. ShedLock)
	 *   or change the selection strategy to avoid duplicate publishing work.
	 */
	@Scheduled(fixedDelayString = "${outbox.publisher.fixed-delay-ms:1000}")
	public void publishPending() {
		// Keep DB transaction short: claim rows quickly, then publish outside the lock window.
		List<OutboxEvent> pending = claimPending(batchSize);
		if (pending.isEmpty()) {
			return;
		}

		for (OutboxEvent event : pending) {
			try {
				kafkaTemplate
					.send(event.getTopic(), event.getMessageKey(), event.getPayload())
					.get(sendTimeoutMs, TimeUnit.MILLISECONDS);
				markSent(event.getEventId());

				// Best-effort MDC enrichment for operational traceability.
				try (MDC.MDCCloseable mdcJobId = MDC.putCloseable("jobId", event.getMessageKey());
					 MDC.MDCCloseable mdcTraceId = MDC.putCloseable("traceId", extractTraceId(event.getPayload(), event.getMessageKey()));
					 MDC.MDCCloseable mdcEventId = MDC.putCloseable("eventId", event.getEventId())) {
					log.info("Outbox published. eventId={} topic={} key={}", event.getEventId(), event.getTopic(), event.getMessageKey());
				}
			} catch (Exception e) {
				String msg = e.getMessage();
				markFailed(event.getEventId(), msg);
				log.warn("Outbox publish failed. eventId={} topic={} key={} err={}",
					event.getEventId(), event.getTopic(), event.getMessageKey(), e.toString(), e);
			}
		}
	}

	protected List<OutboxEvent> claimPending(int limit) {
		return tx.execute(status -> {
			// Safety net for crashes: release rows that got stuck in PROCESSING.
			outboxEventRepository.resetStuckProcessing(processingTimeoutSeconds);

			List<OutboxEvent> pending = outboxEventRepository.findPendingSkipLocked(limit);
			for (OutboxEvent e : pending) {
				e.markProcessing();
			}
			return pending;
		});
	}

	protected void markSent(String eventId) {
		tx.executeWithoutResult(status -> {
			OutboxEvent e = outboxEventRepository.findById(eventId).orElse(null);
			if (e == null) {
				return;
			}
			e.markSent(LocalDateTime.now());
		});
	}

	protected void markFailed(String eventId, String errorMessage) {
		tx.executeWithoutResult(status -> {
			OutboxEvent e = outboxEventRepository.findById(eventId).orElse(null);
			if (e == null) {
				return;
			}
			e.markFailed(errorMessage, maxAttempts);
		});
	}
	private String extractTraceId(String payload, String fallbackJobId) {
		if (payload == null || payload.isBlank()) {
			return "job:" + fallbackJobId;
		}
		try {
			EventEnvelope env = objectMapper.readValue(payload, EventEnvelope.class);
			if (env.traceId() != null && !env.traceId().isBlank()) {
				return env.traceId();
			}
			if (env.aggregateId() != null && !env.aggregateId().isBlank()) {
				return "job:" + env.aggregateId();
			}
		} catch (Exception ignored) {
			// ignore parse failure, fall back
		}
		return "job:" + fallbackJobId;
	}
}
