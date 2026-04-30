package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record ReactionCreateRequest(
        @Schema(description = "분석 결과 ID", example = "1")
        @NotNull Long analysisId,
        @Schema(description = "반응 종류, true는 좋아요이고 false는 싫어요입니다.", example = "true")
        @NotNull Boolean reactionType
) {
}
