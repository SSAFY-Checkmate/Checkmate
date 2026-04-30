package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserFeedbackUpdateRequest(
        @Schema(description = "수정할 사용자 피드백 사유", example = "표현은 과장됐지만 명백한 허위는 아닙니다.")
        @NotBlank String reason,
        @Schema(description = "수정할 정확성 여부, true는 정확함이고 false는 부정확함입니다.", example = "false")
        @NotNull Boolean isCorrect
) {
}
