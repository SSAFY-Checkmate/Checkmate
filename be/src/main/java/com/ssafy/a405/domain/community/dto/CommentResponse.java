package com.ssafy.a405.domain.community.dto;

import com.ssafy.a405.domain.community.entity.Comment;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        Long analysisId,
        Long userId,
        String userName,
        Long parentCommentId,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentResponse> replies
) {
    public static CommentResponse from(Comment comment) {
        return from(comment, List.of());
    }

    public static CommentResponse from(Comment comment, List<CommentResponse> replies) {
        return new CommentResponse(
                comment.getId(),
                comment.getAnalysisResult().getId(),
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getParentComment() == null ? null : comment.getParentComment().getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}
