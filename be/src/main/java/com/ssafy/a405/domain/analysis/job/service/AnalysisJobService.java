package com.ssafy.a405.domain.analysis.job.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.job.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.job.dto.AnalysisRequestedPayload;
import com.ssafy.a405.domain.analysis.job.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.job.repository.AnalysisJobRepository;
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

	@Value("${topics.analysis.requested:analysis.requested}")
	private String analysisRequestedTopic;

	@Transactional
	public AnalysisJob createRequestedJob(String youtubeUrl) {
		AnalysisJob job = AnalysisJob.requested(youtubeUrl);
		analysisJobRepository.save(job);

		AnalysisRequestedPayload payload = new AnalysisRequestedPayload(job.getJobId(), job.getYoutubeUrl());
		EventEnvelope envelope = new EventEnvelope(
			// eventId
			java.util.UUID.randomUUID().toString(),
			// eventType
			"analysis.requested",
			// eventVersion
			1,
			// occurredAt
			Instant.now(),
			// traceId
			null,
			// aggregateId
			job.getJobId(),
			// payload
			objectMapper.valueToTree(payload)
		);

		outboxService.enqueue(analysisRequestedTopic, job.getJobId(), envelope);
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
	}

	@Transactional
	public void applyFailed(String jobId, String errorCode, String errorMessage) {
		AnalysisJob job = analysisJobRepository.findById(jobId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.fail(LocalDateTime.now(), errorCode, errorMessage);
	}
}

