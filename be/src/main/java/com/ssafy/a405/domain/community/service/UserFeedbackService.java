package com.ssafy.a405.domain.community.service;

import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.domain.community.dto.UserFeedbackCreateRequest;
import com.ssafy.a405.domain.community.dto.UserFeedbackResponse;
import com.ssafy.a405.domain.community.dto.UserFeedbackUpdateRequest;
import com.ssafy.a405.domain.community.entity.UserFeedback;
import com.ssafy.a405.domain.community.repository.UserFeedbackRepository;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserFeedbackService {

    private final UserFeedbackRepository userFeedbackRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserFeedbackResponse createUserFeedback(Long userId, UserFeedbackCreateRequest request) {
        userFeedbackRepository.findByAnalysisResultIdAndUserId(request.analysisId(), userId)
                .ifPresent(userFeedback -> {
                    throw new CustomException(ErrorCode.BAD_REQUEST);
                });

        UserFeedback userFeedback = userFeedbackRepository.save(
                UserFeedback.builder()
                        .analysisResult(getAnalysisResult(request.analysisId()))
                        .user(getUser(userId))
                        .reason(request.reason())
                        .isCorrect(request.isCorrect())
                        .build()
        );

        return UserFeedbackResponse.from(userFeedback);
    }

    @Transactional(readOnly = true)
    public UserFeedbackResponse getUserFeedback(Long userFeedbackId) {
        return UserFeedbackResponse.from(getUserFeedbackEntity(userFeedbackId));
    }

    @Transactional(readOnly = true)
    public List<UserFeedbackResponse> getUserFeedbacks(Long analysisId) {
        getAnalysisResult(analysisId);
        return userFeedbackRepository.findAllByAnalysisResultIdOrderByCreatedAtDesc(analysisId).stream()
                .map(UserFeedbackResponse::from)
                .toList();
    }

    @Transactional
    public UserFeedbackResponse updateUserFeedback(Long userId, Long userFeedbackId, UserFeedbackUpdateRequest request) {
        UserFeedback userFeedback = getUserFeedbackEntity(userFeedbackId);
        validateOwner(userId, userFeedback.getUser().getId());
        userFeedback.updateFeedback(request.reason(), request.isCorrect());
        return UserFeedbackResponse.from(userFeedback);
    }

    @Transactional
    public void deleteUserFeedback(Long userId, Long userFeedbackId) {
        UserFeedback userFeedback = getUserFeedbackEntity(userFeedbackId);
        validateOwner(userId, userFeedback.getUser().getId());
        userFeedbackRepository.delete(userFeedback);
    }

    private UserFeedback getUserFeedbackEntity(Long userFeedbackId) {
        return userFeedbackRepository.findById(userFeedbackId)
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
