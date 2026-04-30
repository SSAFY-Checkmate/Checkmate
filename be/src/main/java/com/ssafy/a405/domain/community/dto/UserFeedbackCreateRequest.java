package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserFeedbackCreateRequest(
        @Schema(description = "분석 결과 ID", example = "1")
        @NotNull Long analysisId,
        @Schema(description = "사용자 피드백 사유", example = "문맥상 허위정보로 보기 어렵습니다.")
        @NotBlank String reason,
        @Schema(description = "분석 결과가 맞는지 여부, true는 정확함이고 false는 부정확함입니다.", example = "true")
        @NotNull Boolean isCorrect
) {
}
