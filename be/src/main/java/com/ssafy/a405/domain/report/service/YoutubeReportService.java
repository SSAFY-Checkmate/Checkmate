package com.ssafy.a405.domain.report.service;

import com.ssafy.a405.domain.report.entity.ReportHistory;
import com.ssafy.a405.domain.report.entity.ReportStatus;
import com.ssafy.a405.domain.report.repository.ReportHistoryRepository;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class YoutubeReportService {

    private final ReportHistoryRepository reportHistoryRepository;
    private final UserRepository userRepository;
    
    // Spring Boot 3.2+ 최신 표준 HTTP 클라이언트
    private final RestClient restClient = RestClient.create();

    @Transactional
    public void reportVideo(Long userId, String videoId, String reasonId, String secondaryReasonId, String googleAccessToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String youtubeApiUrl = "https://www.googleapis.com/youtube/v3/videos/reportAbuse";

        try {
            // 1. 유튜브 API 대리 호출
            Map<String, String> body = new java.util.HashMap<>();
            body.put("videoId", videoId);
            body.put("reasonId", reasonId);
            if (secondaryReasonId != null && !secondaryReasonId.isBlank()) {
                body.put("secondaryReasonId", secondaryReasonId);
            }

            restClient.post()
                    .uri(youtubeApiUrl)
                    .header("Authorization", "Bearer " + googleAccessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity(); // 응답 바디가 필요 없으므로 상태 코드만 확인

            log.info("유튜브 신고 성공: userId={}, videoId={}", user.getId(), videoId);

            // 2. 이력 저장 (성공)
            saveHistory(user, videoId, reasonId, ReportStatus.SUCCESS);

        } catch (Exception e) {
            log.error("유튜브 신고 실패: userId={}, videoId={}, error={}", user.getId(), videoId, e.getMessage());

            // 3. 이력 저장 (실패)
            saveHistory(user, videoId, reasonId, ReportStatus.FAIL);

            // 프론트엔드(익스텐션)에 에러를 알려주기 위해 예외 던짐
            throw new RuntimeException("유튜브 API 호출 실패: " + e.getMessage());
        }
    }

    private void saveHistory(User user, String videoId, String reasonId, ReportStatus status) {
        ReportHistory history = ReportHistory.builder()
                .user(user)
                .videoId(videoId)
                .reasonId(reasonId)
                .status(status)
                .build();
        reportHistoryRepository.save(history);
    }
}
