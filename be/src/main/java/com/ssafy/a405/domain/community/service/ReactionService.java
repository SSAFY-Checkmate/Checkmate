package com.ssafy.a405.domain.community.service;

import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.domain.community.dto.ReactionCreateRequest;
import com.ssafy.a405.domain.community.dto.ReactionResponse;
import com.ssafy.a405.domain.community.dto.ReactionUpdateRequest;
import com.ssafy.a405.domain.community.entity.Reaction;
import com.ssafy.a405.domain.community.repository.ReactionRepository;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReactionResponse createReaction(Long userId, ReactionCreateRequest request) {
        java.util.Optional<Reaction> existingReaction = reactionRepository.findByAnalysisResultIdAndUserId(request.analysisId(), userId);

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getReactionType().equals(request.reactionType())) {
                reactionRepository.delete(reaction);
                return null;
            } else {
                reaction.updateReactionType(request.reactionType());
                return ReactionResponse.from(reaction);
            }
        }

        Reaction reaction = reactionRepository.save(
                Reaction.builder()
                        .analysisResult(getAnalysisResult(request.analysisId()))
                        .user(getUser(userId))
                        .reactionType(request.reactionType())
                        .build()
        );

        return ReactionResponse.from(reaction);
    }

    @Transactional(readOnly = true)
    public ReactionResponse getReaction(Long reactionId) {
        return ReactionResponse.from(getReactionEntity(reactionId));
    }

    @Transactional(readOnly = true)
    public List<ReactionResponse> getReactions(Long analysisId) {
        getAnalysisResult(analysisId);
        return reactionRepository.findAllByAnalysisResultIdOrderByCreatedAtDesc(analysisId).stream()
                .map(ReactionResponse::from)
                .toList();
    }

    @Transactional
    public ReactionResponse updateReaction(Long userId, Long reactionId, ReactionUpdateRequest request) {
        Reaction reaction = getReactionEntity(reactionId);
        validateOwner(userId, reaction.getUser().getId());
        reaction.updateReactionType(request.reactionType());
        log.info("community.reaction_updated userId={} reactionId={} reactionType={}",
            userId, reactionId, request.reactionType());
        return ReactionResponse.from(reaction);
    }

    @Transactional
    public void deleteReaction(Long userId, Long reactionId) {
        Reaction reaction = getReactionEntity(reactionId);
        validateOwner(userId, reaction.getUser().getId());
        reactionRepository.delete(reaction);
        log.info("community.reaction_deleted userId={} reactionId={}", userId, reactionId);
    }

    private Reaction getReactionEntity(Long reactionId) {
        return reactionRepository.findById(reactionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }

    private AnalysisResult getAnalysisResult(Long analysisId) {
        return analysisResultRepository.findById(analysisId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }

    private void validateOwner(Long userId, Long ownerId) {
        if (!ownerId.equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }
}
