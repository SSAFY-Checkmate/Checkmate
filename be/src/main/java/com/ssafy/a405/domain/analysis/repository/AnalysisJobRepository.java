package com.ssafy.a405.domain.analysis.repository;

import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, String> {
	Optional<AnalysisJob> findFirstByYoutubeUrlOrderByCreatedAtDesc(String youtubeUrl);
}

