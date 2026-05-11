package com.ssafy.a405.global.kafka.transcript;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.TranscriptCompletedPayload;
import com.ssafy.a405.domain.analysis.dto.TranscriptFailedPayload;
import com.ssafy.a405.domain.analysis.service.AnalysisJobService;
import com.ssafy.a405.domain.event.EventEnvelope;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.domain.inbox.service.InboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

/**
 * Consumes transcript events and advances the analysis pipeline.
 *
 * - transcript.completed -> store transcript artifact reference on the job, then enqueue analysis.requested
 * - transcript.failed    -> mark job as FAILED
 *
 * This uses Inbox-based de-dup and manual acknowledgment.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TranscriptEventConsumer {

    private static final String CONSUMER_NAME = "be-transcript-updater";

    private final ObjectMapper objectMapper;
    private final InboxService inboxService;
    private final AnalysisJobService analysisJobService;

    @KafkaListener(topics = "${topics.transcript.completed:transcript.completed}")
    public void onTranscriptCompleted(String message, Acknowledgment ack) throws Exception {
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

        try (MDC.MDCCloseable traceId = MDC.putCloseable("traceId", traceIdForMdc);
             MDC.MDCCloseable jobId = MDC.putCloseable("jobId", jobIdForMdc);
             MDC.MDCCloseable ev = MDC.putCloseable("eventId", eventId)) {
            TranscriptCompletedPayload payload = objectMapper.treeToValue(envelope.payload(), TranscriptCompletedPayload.class);
            // Propagate a non-empty traceId downstream even if the upstream producer omitted it.
            analysisJobService.applyTranscriptCompleted(payload, traceIdForMdc);

            log.info("transcript.completed received. eventId={}, aggregateId={}, traceId={}",
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
            log.error("transcript.completed handler failed. eventId={} jobId={} err={}",
                envelope.eventId(), envelope.aggregateId(), e.toString(), e);
            inboxService.markFailed(CONSUMER_NAME, eventId, e.getMessage());
            // Avoid poison-pill loops: mark FAILED and acknowledge.
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${topics.transcript.failed:transcript.failed}")
    public void onTranscriptFailed(String message, Acknowledgment ack) throws Exception {
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

        try (MDC.MDCCloseable traceId = MDC.putCloseable("traceId", traceIdForMdc);
             MDC.MDCCloseable jobId = MDC.putCloseable("jobId", jobIdForMdc);
             MDC.MDCCloseable ev = MDC.putCloseable("eventId", eventId)) {
            TranscriptFailedPayload payload = objectMapper.treeToValue(envelope.payload(), TranscriptFailedPayload.class);
            analysisJobService.applyTranscriptFailed(payload);

            log.warn("transcript.failed received. eventId={}, aggregateId={}, traceId={}",
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
            log.error("transcript.failed handler failed. eventId={} jobId={} err={}",
                envelope.eventId(), envelope.aggregateId(), e.toString(), e);
            inboxService.markFailed(CONSUMER_NAME, eventId, e.getMessage());
            // Avoid poison-pill loops: mark FAILED and acknowledge.
            ack.acknowledge();
        }
    }
}
