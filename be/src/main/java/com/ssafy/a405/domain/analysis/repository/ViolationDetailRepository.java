package com.ssafy.a405.domain.analysis.repository;

import com.ssafy.a405.domain.analysis.entity.ViolationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationDetailRepository extends JpaRepository<ViolationDetail, Long> {
    List<ViolationDetail> findByAnalysisResultId(Long analysisResultId);
}
