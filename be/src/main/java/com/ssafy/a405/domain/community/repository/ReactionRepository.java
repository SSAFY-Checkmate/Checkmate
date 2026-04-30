package com.ssafy.a405.domain.community.repository;

import com.ssafy.a405.domain.community.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    List<Reaction> findAllByAnalysisResultIdOrderByCreatedAtDesc(Long analysisId);

    Optional<Reaction> findByAnalysisResultIdAndUserId(Long analysisId, Long userId);
}
