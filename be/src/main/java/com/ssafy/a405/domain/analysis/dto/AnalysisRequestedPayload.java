package com.ssafy.a405.domain.analysis.dto;

public record AnalysisRequestedPayload(
	String jobId,
	String youtubeUrl,
	String transcriptArtifactKey
) {
}

