package com.ssafy.a405.domain.community.service;

import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.domain.community.dto.CommentCreateRequest;
import com.ssafy.a405.domain.community.dto.CommentPageResponse;
import com.ssafy.a405.domain.community.dto.CommentResponse;
import com.ssafy.a405.domain.community.dto.CommentUpdateRequest;
import com.ssafy.a405.domain.community.entity.Comment;
import com.ssafy.a405.domain.community.repository.CommentRepository;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private static final int COMMENT_PAGE_SIZE = 10;

    private final CommentRepository commentRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long userId, CommentCreateRequest request) {
        Comment comment = commentRepository.save(
                Comment.builder()
                        .analysisResult(getAnalysisResult(request.analysisId()))
                        .user(getUser(userId))
                        .content(request.content())
                        .build()
        );

        return CommentResponse.from(comment);
    }

    @Transactional(readOnly = true)
    public CommentResponse getComment(Long commentId) {
        return CommentResponse.from(getCommentEntity(commentId));
    }

    @Transactional(readOnly = true)
    public CommentPageResponse getComments(Long analysisId, int page) {
        getAnalysisResult(analysisId);
        if (page < 0) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        Page<CommentResponse> commentPage = commentRepository
                .findAllByAnalysisResultIdOrderByCreatedAtDesc(analysisId, PageRequest.of(page, COMMENT_PAGE_SIZE))
                .map(CommentResponse::from);

        return CommentPageResponse.from(commentPage);
    }

    @Transactional
    public CommentResponse updateComment(Long userId, Long commentId, CommentUpdateRequest request) {
        Comment comment = getCommentEntity(commentId);
        validateOwner(userId, comment.getUser().getId());
        comment.updateContent(request.content());
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = getCommentEntity(commentId);
        validateOwner(userId, comment.getUser().getId());
        commentRepository.delete(comment);
    }

    private Comment getCommentEntity(Long commentId) {
        return commentRepository.findById(commentId)
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
