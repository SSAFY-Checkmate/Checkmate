package com.ssafy.a405.domain.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(description = "댓글 페이지 응답")
public record CommentPageResponse(
        @Schema(description = "현재 페이지 번호", example = "0")
        int page,
        @Schema(description = "페이지 크기", example = "10")
        int size,
        @Schema(description = "전체 페이지 수", example = "2")
        int totalPages,
        @Schema(description = "전체 댓글 수", example = "15")
        long totalElements,
        @Schema(description = "다음 페이지 존재 여부", example = "true")
        boolean hasNext,
        @Schema(description = "현재 페이지 댓글 목록")
        List<CommentResponse> content
) {
    public static CommentPageResponse from(Page<CommentResponse> page) {
        return new CommentPageResponse(
                page.getNumber(),
                page.getSize(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.hasNext(),
                page.getContent()
        );
    }
}
