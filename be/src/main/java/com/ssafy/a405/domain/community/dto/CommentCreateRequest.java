package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentCreateRequest(
        @Schema(description = "분석 결과 ID", example = "1")
        @NotNull Long analysisId,
        @Schema(description = "댓글 내용", example = "이 부분은 근거를 더 확인해봐야 할 것 같습니다.")
        @NotBlank String content
) {
}
