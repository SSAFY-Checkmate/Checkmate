package com.ssafy.a405.domain.analysis.dto;

public record TranscriptFailedPayload(
	String jobId,
	String errorCode,
	String message
) {
}

