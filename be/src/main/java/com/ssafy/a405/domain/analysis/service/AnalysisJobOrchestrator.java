package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.dto.TranscriptRequestedPayload;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.domain.event.EventEnvelope;
import com.ssafy.a405.global.outbox.service.OutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnalysisJobOrchestrator {

	private final AnalysisJobService analysisJobService;
	private final AnalysisHttpPipelineService analysisHttpPipelineService;
	private final OutboxService outboxService;
	private final ObjectMapper objectMapper;

	@Value("${topics.transcript.requested:transcript.requested}")
	private String transcriptRequestedTopic;

	@Value("${analysis.dedup.enabled:false}")
	private boolean dedupEnabled;

	public AnalysisJob requestAnalysisAsync(String youtubeUrl) {
		if (dedupEnabled) {
			AnalysisJob existing = analysisJobService.findLatestByYoutubeUrl(youtubeUrl).orElse(null);
			if (existing != null && existing.getStatus() != AnalysisJobStatus.FAILED) {
				return existing;
			}
		}

		AnalysisJob job = analysisJobService.createJob(youtubeUrl);
		// Endpoint contract: POST /analysis is always Kafka async mode.
		// Outbox publisher is responsible for the actual Kafka publish.
		enqueueTranscriptRequested(job);

		return job;
	}

	public AnalysisJobGetResponse requestAnalysisSync(String youtubeUrl) {
		if (dedupEnabled) {
			AnalysisJob existing = analysisJobService.findLatestByYoutubeUrl(youtubeUrl).orElse(null);
			if (existing != null && existing.getStatus() == AnalysisJobStatus.COMPLETED) {
				return analysisJobService.getJob(existing.getJobId());
			}
			if (existing != null && existing.getStatus() != AnalysisJobStatus.FAILED) {
				// In-progress: return current status instead of blocking on a duplicate sync run.
				return analysisJobService.getJob(existing.getJobId());
			}
		}

		AnalysisJob job = analysisJobService.createJob(youtubeUrl);
		// Endpoint contract: POST /analysis/sync is always HTTP sync mode (even when the system also uses Kafka).
		analysisHttpPipelineService.runSync(job.getJobId());
		return analysisJobService.getJob(job.getJobId());
	}

	private void enqueueTranscriptRequested(AnalysisJob job) {
		TranscriptRequestedPayload payload = new TranscriptRequestedPayload(job.getJobId(), job.getYoutubeUrl());
		EventEnvelope envelope = new EventEnvelope(
			java.util.UUID.randomUUID().toString(),
			"transcript.requested",
			1,
			Instant.now(),
			null,
			job.getJobId(),
			objectMapper.valueToTree(payload)
		);
		// Actual Kafka publish is done by Outbox publisher.
		log.info("transcript.requested enqueued. topic={} jobId={}", transcriptRequestedTopic, job.getJobId());
		outboxService.enqueue(transcriptRequestedTopic, job.getJobId(), envelope);
	}
}
