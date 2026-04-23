package com.ssafy.a405.domain.analysis.job.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.ssafy.a405.domain.analysis.job.entity.AnalysisJobStatus;

public record AnalysisJobGetResponse(
	String jobId,
	AnalysisJobStatus status,
	String youtubeUrl,
	JsonNode result,
	ErrorInfo error
) {
	public record ErrorInfo(
		String code,
		String message
	) {
	}
}

