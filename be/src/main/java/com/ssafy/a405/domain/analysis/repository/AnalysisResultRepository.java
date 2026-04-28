package com.ssafy.a405.domain.analysis.repository;

import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    Optional<AnalysisResult> findFirstByVideoYtVideoIdOrderByCreatedAtDesc(String ytVideoId);
}
