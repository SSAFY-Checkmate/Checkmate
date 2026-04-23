package com.ssafy.a405.domain.analysis.job.dto;

import com.ssafy.a405.domain.analysis.job.entity.AnalysisJobStatus;

public record AnalysisJobCreateResponse(
	String jobId,
	AnalysisJobStatus status
) {
}

