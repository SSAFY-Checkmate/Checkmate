package com.ssafy.a405.global.kafka.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.ssafy.a405.domain.analysis.service.AnalysisJobService;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.domain.event.EventEnvelope;
import com.ssafy.a405.domain.inbox.service.InboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

/**
 * Skeleton consumer: demonstrates Inbox-based de-dup and manual acknowledgment.
 *
 * Replace the TODOs with actual domain updates (e.g. AnalysisJob status update).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisEventConsumer {

	private static final String CONSUMER_NAME = "be-analysis-updater";

	private final ObjectMapper objectMapper;
	private final InboxService inboxService;
	private final AnalysisJobService analysisJobService;

	@KafkaListener(topics = "${topics.analysis.completed:analysis.completed}")
	public void onCompleted(String message, Acknowledgment ack) throws Exception {
		EventEnvelope envelope = objectMapper.readValue(message, EventEnvelope.class);
		String eventId = envelope.eventId();
		String jobIdForMdc = envelope.aggregateId();
		String traceIdForMdc = (envelope.traceId() != null && !envelope.traceId().isBlank())
			? envelope.traceId()
			: (jobIdForMdc != null && !jobIdForMdc.isBlank() ? "job:" + jobIdForMdc : "event:" + eventId);

		if (!inboxService.beginProcessing(CONSUMER_NAME, eventId)) {
			ack.acknowledge();
			return;
		}

		try (MDC.MDCCloseable mdcTraceId = MDC.putCloseable("traceId", traceIdForMdc);
			 MDC.MDCCloseable mdcJobId = MDC.putCloseable("jobId", jobIdForMdc);
			 MDC.MDCCloseable mdcEventId = MDC.putCloseable("eventId", eventId)) {
			String jobId = envelope.aggregateId();
			if (jobId == null || jobId.isBlank()) {
				throw new IllegalArgumentException("aggregateId(jobId) is missing");
			}

			String resultJson = objectMapper.writeValueAsString(envelope.payload());
			analysisJobService.applyCompleted(jobId, resultJson);

			log.info("analysis.completed received. eventId={}, aggregateId={}, traceId={}",
				envelope.eventId(), envelope.aggregateId(), envelope.traceId());

			inboxService.markProcessed(CONSUMER_NAME, eventId);
			ack.acknowledge();
		} catch (Exception e) {
			// If the job doesn't exist, acknowledge to avoid a poison-pill loop.
			if (e instanceof CustomException ce && ce.getErrorStatus() == ErrorCode.NOT_FOUND) {
				inboxService.markProcessed(CONSUMER_NAME, eventId);
				ack.acknowledge();
				return;
			}
			log.error("analysis.completed handler failed. eventId={} jobId={} err={}",
				envelope.eventId(), envelope.aggregateId(), e.toString(), e);
			inboxService.markFailed(CONSUMER_NAME, eventId, e.getMessage());
			// Avoid poison-pill loops: mark FAILED and acknowledge.
			ack.acknowledge();
		}
	}

	@KafkaListener(topics = "${topics.analysis.failed:analysis.failed}")
	public void onFailed(String message, Acknowledgment ack) throws Exception {
		EventEnvelope envelope = objectMapper.readValue(message, EventEnvelope.class);
		String eventId = envelope.eventId();
		String jobIdForMdc = envelope.aggregateId();
		String traceIdForMdc = (envelope.traceId() != null && !envelope.traceId().isBlank())
			? envelope.traceId()
			: (jobIdForMdc != null && !jobIdForMdc.isBlank() ? "job:" + jobIdForMdc : "event:" + eventId);

		if (!inboxService.beginProcessing(CONSUMER_NAME, eventId)) {
			ack.acknowledge();
			return;
		}

		try (MDC.MDCCloseable mdcTraceId = MDC.putCloseable("traceId", traceIdForMdc);
			 MDC.MDCCloseable mdcJobId = MDC.putCloseable("jobId", jobIdForMdc);
			 MDC.MDCCloseable mdcEventId = MDC.putCloseable("eventId", eventId)) {
			String jobId = envelope.aggregateId();
			if (jobId == null || jobId.isBlank()) {
				throw new IllegalArgumentException("aggregateId(jobId) is missing");
			}

			JsonNode p = envelope.payload();
			String errorCode = p != null && p.hasNonNull("errorCode") ? p.get("errorCode").asText() : "ANALYSIS_FAILED";
			String errorMessage = p != null && p.hasNonNull("message") ? p.get("message").asText() : null;
			analysisJobService.applyFailed(jobId, errorCode, errorMessage);

			log.warn("analysis.failed received. eventId={}, aggregateId={}, traceId={}",
				envelope.eventId(), envelope.aggregateId(), envelope.traceId());

			inboxService.markProcessed(CONSUMER_NAME, eventId);
			ack.acknowledge();
		} catch (Exception e) {
			// If the job doesn't exist, acknowledge to avoid a poison-pill loop.
			if (e instanceof CustomException ce && ce.getErrorStatus() == ErrorCode.NOT_FOUND) {
				inboxService.markProcessed(CONSUMER_NAME, eventId);
				ack.acknowledge();
				return;
			}
			log.error("analysis.failed handler failed. eventId={} jobId={} err={}",
				envelope.eventId(), envelope.aggregateId(), e.toString(), e);
			inboxService.markFailed(CONSUMER_NAME, eventId, e.getMessage());
			// Avoid poison-pill loops: mark FAILED and acknowledge.
			ack.acknowledge();
		}
	}
}
