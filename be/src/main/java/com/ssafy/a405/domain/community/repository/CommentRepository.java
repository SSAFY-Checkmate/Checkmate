package com.ssafy.a405.domain.community.repository;

import com.ssafy.a405.domain.community.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findAllByAnalysisResultIdAndParentCommentIsNullOrderByCreatedAtDesc(Long analysisId, Pageable pageable);

    List<Comment> findAllByParentCommentIdInOrderByCreatedAtAsc(List<Long> parentCommentIds);
}
