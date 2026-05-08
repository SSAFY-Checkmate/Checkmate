package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.dto.AnalysisReportResponse;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.analysis.entity.ViolationDetail;
import com.ssafy.a405.domain.analysis.enums.AnalysisJobStatus;
import com.ssafy.a405.domain.analysis.repository.AnalysisJobRepository;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.domain.analysis.repository.ViolationDetailRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisJobRepository analysisJobRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final ViolationDetailRepository violationDetailRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AnalysisReportResponse getAnalysisResult(String jobId) {
        AnalysisJob job = analysisJobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        if (job.getStatus() != AnalysisJobStatus.COMPLETED) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        String videoIdStr = extractVideoId(jobId, job.getResultJson());
        if (videoIdStr == null) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        AnalysisResult result = analysisResultRepository.findFirstByVideoYtVideoIdOrderByCreatedAtDesc(videoIdStr)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        List<ViolationDetail> violations = violationDetailRepository.findByAnalysisResultId(result.getId());

        List<AnalysisReportResponse.ViolationDto> violationDtos = violations.stream()
                .map(v -> new AnalysisReportResponse.ViolationDto(v.getStartTime(), v.getViolationSentence(), v.getReason()))
                .toList();

        return AnalysisReportResponse.builder()
                .videoId(result.getVideo().getYtVideoId())
                .videoTitle(result.getVideo().getTitle())
                .channelName(result.getVideo().getChannel().getChannelName())
                .trustGrade(result.getStatus())
                .confidenceScore(result.getConfidenceScore())
                .summary(result.getSummary())
                .violations(violationDtos)
                .build();
    }

    private String extractVideoId(String jobId, String resultJson) {
        try {
            return objectMapper.readTree(resultJson).path("transcript").path("video_id").asText(null);
        } catch (Exception e) {
            log.warn("analysis.result_extract_videoId_failed jobId={} resultChars={}", jobId, resultJson == null ? 0 : resultJson.length(), e);
            return null;
        }
    }
}
