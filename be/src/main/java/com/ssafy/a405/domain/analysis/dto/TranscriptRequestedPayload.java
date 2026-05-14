package com.ssafy.a405.domain.analysis.dto;

import com.ssafy.a405.domain.analysis.enums.AnalysisRequestMode;

public record TranscriptRequestedPayload(
	String jobId,
	String youtubeUrl,
	AnalysisRequestMode requestMode,
	Double startSeconds,
	Double endSeconds,
	Double atSeconds,
	Double windowSeconds
) {
}

