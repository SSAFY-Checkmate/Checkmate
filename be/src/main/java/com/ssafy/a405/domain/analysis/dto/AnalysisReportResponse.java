package com.ssafy.a405.domain.analysis.dto;

import com.ssafy.a405.domain.analysis.enums.AnalysisRequestMode;
import com.ssafy.a405.global.common.enums.TrustGrade;
import lombok.Builder;

import java.util.List;

@Builder
public record AnalysisReportResponse(
        String videoId,
        String videoTitle,
        String channelName,
        TrustGrade trustGrade,
        Integer confidenceScore,
        String summary,
        List<ViolationDto> violations,
        AnalysisRequestMode requestMode,
        Double rangeStartSeconds,
        Double rangeEndSeconds,
        Double atSeconds,
        Double windowSeconds
) {
    @Builder
    public record ViolationDto(
            Integer startTime,
            String violationSentence,
            String reason
    ) {}
}
