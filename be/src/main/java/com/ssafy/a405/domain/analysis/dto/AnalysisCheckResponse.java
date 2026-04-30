package com.ssafy.a405.domain.analysis.dto;

import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;

public record AnalysisCheckResponse(
    boolean isAnalyzed,
    String jobId,
    AnalysisJobStatus jobStatus
) {
}
