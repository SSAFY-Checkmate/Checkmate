package com.ssafy.a405.domain.analysis.job.repository;

import com.ssafy.a405.domain.analysis.job.entity.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, String> {
}

