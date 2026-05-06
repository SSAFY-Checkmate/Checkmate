package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisCheckResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisRequestedPayload;
import com.ssafy.a405.domain.analysis.dto.TranscriptCompletedPayload;
import com.ssafy.a405.domain.analysis.dto.TranscriptFailedPayload;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.domain.analysis.repository.AnalysisJobRepository;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.global.util.YoutubeUrlNormalizer;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.domain.event.EventEnvelope;
import com.ssafy.a405.global.outbox.service.OutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnalysisJobService {

	private final AnalysisJobRepository analysisJobRepository;
	private final AnalysisResultRepository analysisResultRepository;
	private final OutboxService outboxService;
	private final ObjectMapper objectMapper;
	private final AnalysisDataMappingService analysisDataMappingService;

	@Value("${topics.analysis.requested:analysis.requested}")
	private String analysisRequestedTopic;

	@Transactional
	public AnalysisJob createJob(String youtubeUrl) {
		String normalized = YoutubeUrlNormalizer.normalize(youtubeUrl);
		AnalysisJob job = AnalysisJob.requested(normalized);
		analysisJobRepository.save(job);
		return job;
	}

	@Transactional(readOnly = true)
	public Optional<AnalysisJob> findLatestByYoutubeUrl(String youtubeUrl) {
		String raw = youtubeUrl == null ? null : youtubeUrl.trim();
		if (raw == null || raw.isBlank()) {
			return Optional.empty();
		}

		String normalized = YoutubeUrlNormalizer.normalize(raw);

		Optional<AnalysisJob> latest = analysisJobRepository.findFirstByYoutubeUrlOrderByCreatedAtDesc(normalized);
		if (latest.isPresent()) {
			return latest;
		}

		// Backward compatibility: previously stored rows may have un-normalized URLs.
		if (!normalized.equals(raw)) {
			return analysisJobRepository.findFirstByYoutubeUrlOrderByCreatedAtDesc(raw);
		}

		return Optional.empty();
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

		Long analysisId = null;
		if (job.getStatus() == AnalysisJobStatus.COMPLETED) {
			String ytVideoId = null;
			
			// 1. JSON 파싱 시도 (다양한 경로 확인)
			if (resultNode != null) {
				if (resultNode.path("analysis").path("youtubeInfo").has("videoId")) {
					ytVideoId = resultNode.path("analysis").path("youtubeInfo").path("videoId").asText(null);
				} else if (resultNode.path("transcript").has("video_id")) {
					ytVideoId = resultNode.path("transcript").path("video_id").asText(null);
				} else if (resultNode.path("transcript").has("videoId")) {
					ytVideoId = resultNode.path("transcript").path("videoId").asText(null);
				} else if (resultNode.has("videoId")) {
					ytVideoId = resultNode.path("videoId").asText(null);
				}
			}

			// 2. 파싱된 ID로 조회
			if (ytVideoId != null && !ytVideoId.isBlank()) {
				analysisId = analysisResultRepository.findFirstByVideoYtVideoIdOrderByCreatedAtDesc(ytVideoId)
					.map(com.ssafy.a405.domain.analysis.entity.AnalysisResult::getId)
					.orElse(null);
			}
			
			// 3. Fallback: URL 정규화를 통해 직접 조회 (가장 확실한 방법)
			if (analysisId == null && job.getYoutubeUrl() != null) {
				try {
					String normalizedId = YoutubeUrlNormalizer.normalize(job.getYoutubeUrl());
					analysisId = analysisResultRepository.findFirstByVideoYtVideoIdOrderByCreatedAtDesc(normalizedId)
						.map(com.ssafy.a405.domain.analysis.entity.AnalysisResult::getId)
						.orElse(null);
					log.info("[AnalysisJob] Fallback URL lookup success: ytVideoId={} -> analysisId={}", normalizedId, analysisId);
				} catch (Exception e) {
					log.warn("[AnalysisJob] Fallback lookup failed for url={}", job.getYoutubeUrl());
				}
			}
			
			log.info("[AnalysisJob] Final analysisId for jobId={}: {}", jobId, analysisId);
		}

		return new AnalysisJobGetResponse(
			job.getJobId(),
			job.getStatus(),
			job.getYoutubeUrl(),
			resultNode,
			analysisId,
			error
		);
	}

	@Transactional(readOnly = true)
	public AnalysisJobGetResponse getLatestJobByYoutubeUrl(String youtubeUrl) {
		AnalysisJob job = findLatestByYoutubeUrl(youtubeUrl)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		return getJob(job.getJobId());
	}

	@Transactional(readOnly = true)
	public AnalysisCheckResponse checkAnalysisStatus(String youtubeUrl) {
		Optional<AnalysisJob> latest = findLatestByYoutubeUrl(youtubeUrl);
		if (latest.isPresent()) {
			AnalysisJob job = latest.get();
			return new AnalysisCheckResponse(true, job.getJobId(), job.getStatus());
		}
		return new AnalysisCheckResponse(false, null, null);
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
		log.info("analysis.requested enqueued. topic={} jobId={} artifactKey={}", analysisRequestedTopic, job.getJobId(), payload.artifactKey());
		outboxService.enqueue(analysisRequestedTopic, job.getJobId(), analysisRequested);
	}

	@Transactional
	public void applyTranscriptFailed(TranscriptFailedPayload payload) {
		AnalysisJob job = analysisJobRepository.findById(payload.jobId())
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		job.fail(LocalDateTime.now(), payload.errorCode(), payload.message());
	}
}
