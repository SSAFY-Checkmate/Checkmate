package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.dto.TranscriptRequestedPayload;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.domain.event.EventEnvelope;
import com.ssafy.a405.global.outbox.service.OutboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AnalysisJobOrchestrator {

	private final AnalysisJobService analysisJobService;
	private final AnalysisHttpPipelineService analysisHttpPipelineService;
	private final OutboxService outboxService;
	private final ObjectMapper objectMapper;

	@Value("${app.pipeline.mode:http}")
	private String pipelineMode;

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

		if ("kafka".equalsIgnoreCase(pipelineMode)) {
			enqueueTranscriptRequested(job);
		} else {
			analysisHttpPipelineService.run(job.getJobId());
		}

		return job;
	}

	public AnalysisJobGetResponse requestAnalysisSync(String youtubeUrl) {
		if ("kafka".equalsIgnoreCase(pipelineMode)) {
			throw new CustomException(ErrorCode.BAD_REQUEST);
		}

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
		outboxService.enqueue(transcriptRequestedTopic, job.getJobId(), envelope);
	}
}
