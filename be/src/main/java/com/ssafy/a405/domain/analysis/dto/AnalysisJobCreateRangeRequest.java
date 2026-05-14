package com.ssafy.a405.domain.analysis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AnalysisJobCreateRangeRequest(
	@NotBlank String youtubeUrl,
	@NotNull @PositiveOrZero Double startSeconds,
	@NotNull @PositiveOrZero Double endSeconds
) {
}

