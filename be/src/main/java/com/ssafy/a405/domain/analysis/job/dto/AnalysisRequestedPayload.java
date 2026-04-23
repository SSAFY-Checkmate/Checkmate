package com.ssafy.a405.domain.analysis.job.dto;

public record AnalysisRequestedPayload(
	String jobId,
	String youtubeUrl
) {
}

