package com.ssafy.a405.domain.analysis.repository;

import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, String> {
	Optional<AnalysisJob> findFirstByYoutubeUrlOrderByCreatedAtDesc(String youtubeUrl);

	interface AnalysisJobSummaryProjection {
		String getJobId();
		AnalysisJobStatus getStatus();
		String getYoutubeUrl();
		String getErrorCode();
		String getErrorMessage();
	}

	interface AnalysisJobResultProjection {
		String getJobId();
		AnalysisJobStatus getStatus();
		String getYoutubeUrl();
		String getResultJson();
	}

	@Query("""
		select
			j.jobId as jobId,
			j.status as status,
			j.youtubeUrl as youtubeUrl,
			j.errorCode as errorCode,
			j.errorMessage as errorMessage
		from AnalysisJob j
		where j.jobId = :jobId
	""")
	Optional<AnalysisJobSummaryProjection> findSummaryById(@Param("jobId") String jobId);

	@Query("""
		select
			j.jobId as jobId,
			j.status as status,
			j.youtubeUrl as youtubeUrl,
			j.resultJson as resultJson
		from AnalysisJob j
		where j.jobId = :jobId
	""")
	Optional<AnalysisJobResultProjection> findResultById(@Param("jobId") String jobId);
}

