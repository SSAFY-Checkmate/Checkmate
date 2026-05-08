package com.ssafy.a405.domain.report.repository;

import com.ssafy.a405.domain.report.entity.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {
}
