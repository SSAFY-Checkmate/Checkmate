package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record CommentUpdateRequest(
        @Schema(description = "수정할 댓글 내용", example = "해당 발언은 출처를 함께 봐야 판단할 수 있습니다.")
        @NotBlank String content
) {
}
