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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommentService {

    private static final int COMMENT_PAGE_SIZE = 10;

    private final CommentRepository commentRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long userId, CommentCreateRequest request) {
        log.info("community.comment_create_request userId={} analysisId={} contentChars={}",
            userId, request.analysisId(), request.content() == null ? 0 : request.content().length());

        AnalysisResult analysisResult = getAnalysisResult(request.analysisId());
        Comment parentComment = getParentComment(request.parentCommentId(), analysisResult.getId());

        Comment comment = commentRepository.save(
                Comment.builder()
                        .analysisResult(analysisResult)
                        .user(getUser(userId))
                        .parentComment(parentComment)
                        .content(request.content())
                        .build()
        );

        return CommentResponse.from(comment);
    }

    @Transactional(readOnly = true)
    public CommentResponse getComment(Long commentId) {
        Comment comment = getCommentEntity(commentId);
        return CommentResponse.from(comment, getRepliesByParentId(List.of(comment.getId())).getOrDefault(comment.getId(), List.of()));
    }

    @Transactional(readOnly = true)
    public CommentPageResponse getComments(Long analysisId, int page) {
        getAnalysisResult(analysisId);
        if (page < 0) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        Page<Comment> commentPage = commentRepository
                .findAllByAnalysisResultIdAndParentCommentIsNullOrderByCreatedAtDesc(analysisId, PageRequest.of(page, COMMENT_PAGE_SIZE));

        Map<Long, List<CommentResponse>> repliesByParentId = getRepliesByParentId(
                commentPage.getContent().stream().map(Comment::getId).toList()
        );

        Page<CommentResponse> responsePage = commentPage.map(comment ->
                CommentResponse.from(comment, repliesByParentId.getOrDefault(comment.getId(), List.of()))
        );

        return CommentPageResponse.from(responsePage);
    }

    @Transactional
    public CommentResponse updateComment(Long userId, Long commentId, CommentUpdateRequest request) {
        Comment comment = getCommentEntity(commentId);
        validateOwner(userId, comment.getUser().getId());
        comment.updateContent(request.content());
        log.info("community.comment_updated userId={} commentId={} contentChars={}",
            userId, commentId, request.content() == null ? 0 : request.content().length());
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = getCommentEntity(commentId);
        validateOwner(userId, comment.getUser().getId());
        commentRepository.delete(comment);
        log.info("community.comment_deleted userId={} commentId={}", userId, commentId);
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

    private Comment getParentComment(Long parentCommentId, Long analysisId) {
        if (parentCommentId == null) {
            return null;
        }

        Comment parentComment = getCommentEntity(parentCommentId);
        if (!parentComment.getAnalysisResult().getId().equals(analysisId) || parentComment.getParentComment() != null) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        return parentComment;
    }

    private Map<Long, List<CommentResponse>> getRepliesByParentId(List<Long> parentCommentIds) {
        if (parentCommentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return commentRepository.findAllByParentCommentIdInOrderByCreatedAtAsc(parentCommentIds).stream()
                .collect(Collectors.groupingBy(
                        comment -> comment.getParentComment().getId(),
                        Collectors.mapping(CommentResponse::from, Collectors.toList())
                ));
    }

    private void validateOwner(Long userId, Long ownerId) {
        if (!ownerId.equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }
}
