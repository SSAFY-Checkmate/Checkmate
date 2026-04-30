package com.ssafy.a405.domain.community.dto;

import com.ssafy.a405.domain.community.entity.Reaction;

import java.time.LocalDateTime;

public record ReactionResponse(
        Long id,
        Long analysisId,
        Long userId,
        String userName,
        Boolean reactionType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReactionResponse from(Reaction reaction) {
        return new ReactionResponse(
                reaction.getId(),
                reaction.getAnalysisResult().getId(),
                reaction.getUser().getId(),
                reaction.getUser().getName(),
                reaction.getReactionType(),
                reaction.getCreatedAt(),
                reaction.getUpdatedAt()
        );
    }
}
