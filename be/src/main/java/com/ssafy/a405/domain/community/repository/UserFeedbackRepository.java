package com.ssafy.a405.domain.community.repository;

import com.ssafy.a405.domain.community.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {

    List<UserFeedback> findAllByAnalysisResultIdOrderByCreatedAtDesc(Long analysisId);

    Optional<UserFeedback> findByAnalysisResultIdAndUserId(Long analysisId, Long userId);
}
