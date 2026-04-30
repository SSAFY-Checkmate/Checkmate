package com.ssafy.a405.domain.community.dto;

import com.ssafy.a405.domain.community.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long analysisId,
        Long userId,
        String userName,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getAnalysisResult().getId(),
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
