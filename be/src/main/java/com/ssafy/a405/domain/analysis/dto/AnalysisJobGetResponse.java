package com.ssafy.a405.domain.analysis.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.domain.analysis.enums.AnalysisRequestMode;

public record AnalysisJobGetResponse(
	String jobId,
	AnalysisJobStatus status,
	String youtubeUrl,
	JsonNode result,
	Long analysisId,
	AnalysisRequestMode requestMode,
	Double rangeStartSeconds,
	Double rangeEndSeconds,
	Double atSeconds,
	Double windowSeconds,
	ErrorInfo error
) {
	public record ErrorInfo(
		String code,
		String message
	) {
	}
}

