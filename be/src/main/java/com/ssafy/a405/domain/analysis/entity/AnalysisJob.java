package com.ssafy.a405.domain.analysis.entity;

import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.domain.analysis.enums.AnalysisRequestMode;
import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Entity
@Table(name = "analysis_job")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AnalysisJob extends BaseTimeEntity {

	@Id
	@Column(name = "job_id", nullable = false, updatable = false, length = 36)
	private String jobId;

	@Column(name = "youtube_url", nullable = false, columnDefinition = "TEXT")
	private String youtubeUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "request_mode", nullable = false, length = 20)
	private AnalysisRequestMode requestMode;

	@Column(name = "range_start_seconds")
	private Double rangeStartSeconds;

	@Column(name = "range_end_seconds")
	private Double rangeEndSeconds;

	@Column(name = "at_seconds")
	private Double atSeconds;

	@Column(name = "window_seconds")
	private Double windowSeconds;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private AnalysisJobStatus status;

	@Lob
	@Column(name = "result_json", columnDefinition = "LONGTEXT")
	private String resultJson;

	@Column(name = "transcript_artifact_key", length = 300)
	private String transcriptArtifactKey;

	@Column(name = "transcript_expires_at")
	private LocalDateTime transcriptExpiresAt;

	@Column(name = "error_code", length = 100)
	private String errorCode;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Column(name = "processing_started_at")
	private LocalDateTime processingStartedAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	public static AnalysisJob requestedFull(String youtubeUrl) {
		return requested(youtubeUrl, AnalysisRequestMode.FULL, null, null, null, null);
	}

	public static AnalysisJob requestedRange(String youtubeUrl, Double startSeconds, Double endSeconds) {
		return requested(youtubeUrl, AnalysisRequestMode.RANGE, startSeconds, endSeconds, null, null);
	}

	public static AnalysisJob requestedAt(String youtubeUrl, Double atSeconds, Double windowSeconds) {
		return requested(youtubeUrl, AnalysisRequestMode.AT, null, null, atSeconds, windowSeconds);
	}

	private static AnalysisJob requested(
		String youtubeUrl,
		AnalysisRequestMode mode,
		Double rangeStartSeconds,
		Double rangeEndSeconds,
		Double atSeconds,
		Double windowSeconds
	) {
		AnalysisJob job = new AnalysisJob();
		job.jobId = UUID.randomUUID().toString();
		job.youtubeUrl = youtubeUrl;
		job.requestMode = mode == null ? AnalysisRequestMode.FULL : mode;
		job.rangeStartSeconds = rangeStartSeconds;
		job.rangeEndSeconds = rangeEndSeconds;
		job.atSeconds = atSeconds;
		job.windowSeconds = windowSeconds;
		job.status = AnalysisJobStatus.REQUESTED;
		return job;
	}

	public void markTranscriptProcessing(LocalDateTime now) {
		if (this.status == AnalysisJobStatus.COMPLETED || this.status == AnalysisJobStatus.FAILED) {
			return;
		}
		this.status = AnalysisJobStatus.TRANSCRIPT_PROCESSING;
		if (this.processingStartedAt == null) {
			this.processingStartedAt = now;
		}
	}

	public void markAiProcessing(LocalDateTime now, String transcriptArtifactKey, LocalDateTime transcriptExpiresAt) {
		if (this.status == AnalysisJobStatus.COMPLETED || this.status == AnalysisJobStatus.FAILED) {
			return;
		}
		this.status = AnalysisJobStatus.AI_PROCESSING;
		this.transcriptArtifactKey = transcriptArtifactKey;
		this.transcriptExpiresAt = transcriptExpiresAt;
		if (this.processingStartedAt == null) {
			this.processingStartedAt = now;
		}
	}

	public void complete(LocalDateTime now, String resultJson) {
		if (this.status == AnalysisJobStatus.COMPLETED) {
			return;
		}
		if (this.status == AnalysisJobStatus.FAILED) {
			return;
		}
		this.status = AnalysisJobStatus.COMPLETED;
		this.resultJson = resultJson;
		this.completedAt = now;
		this.errorCode = null;
		this.errorMessage = null;
	}

	public void fail(LocalDateTime now, String errorCode, String errorMessage) {
		if (this.status == AnalysisJobStatus.COMPLETED) {
			return;
		}
		if (this.status == AnalysisJobStatus.FAILED) {
			return;
		}
		this.status = AnalysisJobStatus.FAILED;
		this.completedAt = now;
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
	}
}
