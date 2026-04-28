package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisRequestedPayload;
import com.ssafy.a405.domain.analysis.dto.TranscriptCompletedPayload;
import com.ssafy.a405.domain.analysis.dto.TranscriptFailedPayload;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.repository.AnalysisJobRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.global.event.EventEnvelope;
import com.ssafy.a405.global.outbox.service.OutboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnalysisJobService {

	private final AnalysisJobRepository analysisJobRepository;
	private final OutboxService outboxService;
	private final ObjectMapper objectMapper;
	private final AnalysisDataMappingService analysisDataMappingService;

	@Value("${topics.analysis.requested:analysis.requested}")
	private String analysisRequestedTopic;

	@Transactional
	public AnalysisJob createJob(String youtubeUrl) {
		AnalysisJob job = AnalysisJob.requested(youtubeUrl);
		analysisJobRepository.save(job);
		return job;
	}

	@Transactional(readOnly = true)
	public AnalysisJobGetResponse getJob(String jobId) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

		JsonNode resultNode = null;
		if (job.getResultJson() != null) {
			try {
				resultNode = objectMapper.readTree(job.getResultJson());
			} catch (Exception ignored) {
				// If stored payload isn't valid JSON, return null result instead of breaking the API.
			}
		}

		AnalysisJobGetResponse.ErrorInfo error = null;
		if (job.getErrorCode() != null || job.getErrorMessage() != null) {
			error = new AnalysisJobGetResponse.ErrorInfo(job.getErrorCode(), job.getErrorMessage());
		}

		return new AnalysisJobGetResponse(
			job.getJobId(),
			job.getStatus(),
			job.getYoutubeUrl(),
			resultNode,
			error
		);
	}

	@Transactional
	public void applyCompleted(String jobId, String resultJson) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.complete(LocalDateTime.now(), resultJson);
		
		// Map and save to RDB entities
		analysisDataMappingService.mapAndSaveAnalysisResult(resultJson);
	}

	@Transactional
	public void applyFailed(String jobId, String errorCode, String errorMessage) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.fail(LocalDateTime.now(), errorCode, errorMessage);
	}

	@Transactional
	public void applyProcessing(String jobId) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		// Do not wipe transcript reference if it already exists.
		job.markAiProcessing(LocalDateTime.now(), job.getTranscriptArtifactKey(), job.getTranscriptExpiresAt());
	}

	@Transactional
	public void applyTranscriptProcessing(String jobId) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.markTranscriptProcessing(LocalDateTime.now());
	}

	@Transactional
	public void applyTranscriptCompleted(TranscriptCompletedPayload payload, String traceId) {
		AnalysisJob job = analysisJobRepository.findById(payload.jobId())
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

		LocalDateTime expiresAt = null;
		if (payload.ttlSeconds() != null) {
			expiresAt = LocalDateTime.now().plusSeconds(payload.ttlSeconds());
		}

		// Idempotency: if we already stored the same transcript artifact key, don't enqueue another analysis request.
		if (job.getTranscriptArtifactKey() != null && job.getTranscriptArtifactKey().equals(payload.artifactKey())) {
			job.markAiProcessing(LocalDateTime.now(), payload.artifactKey(), expiresAt);
			return;
		}

		job.markAiProcessing(LocalDateTime.now(), payload.artifactKey(), expiresAt);

		AnalysisRequestedPayload analysisPayload = new AnalysisRequestedPayload(
			job.getJobId(),
			job.getYoutubeUrl(),
			payload.artifactKey()
		);
		EventEnvelope analysisRequested = new EventEnvelope(
			java.util.UUID.randomUUID().toString(),
			"analysis.requested",
			1,
			Instant.now(),
			traceId,
			job.getJobId(),
			objectMapper.valueToTree(analysisPayload)
		);
		outboxService.enqueue(analysisRequestedTopic, job.getJobId(), analysisRequested);
	}

	@Transactional
	public void applyTranscriptFailed(TranscriptFailedPayload payload) {
		AnalysisJob job = analysisJobRepository.findById(payload.jobId())
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.fail(LocalDateTime.now(), payload.errorCode(), payload.message());
	}
}
