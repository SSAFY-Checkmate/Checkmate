package com.ssafy.a405.domain.analysis.job.entity;

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
	@Column(name = "status", nullable = false, length = 20)
	private AnalysisJobStatus status;

	@Lob
	@Column(name = "result_json", columnDefinition = "LONGTEXT")
	private String resultJson;

	@Column(name = "error_code", length = 100)
	private String errorCode;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Column(name = "processing_started_at")
	private LocalDateTime processingStartedAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	public static AnalysisJob requested(String youtubeUrl) {
		AnalysisJob job = new AnalysisJob();
		job.jobId = UUID.randomUUID().toString();
		job.youtubeUrl = youtubeUrl;
		job.status = AnalysisJobStatus.REQUESTED;
		return job;
	}

	public void markProcessing(LocalDateTime now) {
		if (this.status == AnalysisJobStatus.COMPLETED || this.status == AnalysisJobStatus.FAILED) {
			return;
		}
		this.status = AnalysisJobStatus.PROCESSING;
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

