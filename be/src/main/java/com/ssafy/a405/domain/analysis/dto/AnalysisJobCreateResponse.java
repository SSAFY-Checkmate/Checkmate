package com.ssafy.a405.domain.analysis.dto;

import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;

public record AnalysisJobCreateResponse(
	String jobId,
	AnalysisJobStatus status
) {
}

