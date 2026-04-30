package com.ssafy.a405.domain.community.dto;

import com.ssafy.a405.domain.community.entity.UserFeedback;

import java.time.LocalDateTime;

public record UserFeedbackResponse(
        Long id,
        Long analysisId,
        Long userId,
        String userName,
        String reason,
        Boolean isCorrect,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserFeedbackResponse from(UserFeedback userFeedback) {
        return new UserFeedbackResponse(
                userFeedback.getId(),
                userFeedback.getAnalysisResult().getId(),
                userFeedback.getUser().getId(),
                userFeedback.getUser().getName(),
                userFeedback.getReason(),
                userFeedback.getIsCorrect(),
                userFeedback.getCreatedAt(),
                userFeedback.getUpdatedAt()
        );
    }
}
