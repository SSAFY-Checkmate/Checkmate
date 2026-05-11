package com.ssafy.a405.domain.analysis.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;

public record AnalysisJobGetResponse(
	String jobId,
	AnalysisJobStatus status,
	String youtubeUrl,
	JsonNode result,
	Long analysisId,
	ErrorInfo error
) {
	public record ErrorInfo(
		String code,
		String message
	) {
	}
}

