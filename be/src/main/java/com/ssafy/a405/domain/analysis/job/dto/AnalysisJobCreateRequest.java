package com.ssafy.a405.domain.analysis.job.dto;

import jakarta.validation.constraints.NotBlank;

public record AnalysisJobCreateRequest(
	@NotBlank String youtubeUrl
) {
}

