package com.ssafy.a405.domain.report.controller;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.report.dto.request.ReportRequest;
import com.ssafy.a405.domain.report.service.YoutubeReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "원터치 신고", description = "유튜브 영상 신고 처리 API")
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class ReportController {

    private final YoutubeReportService youtubeReportService;

    @Operation(summary = "유튜브 영상 신고 대리 수행", description = "익스텐션에서 발급받은 구글 토큰을 사용하여 유튜브 영상을 대리 신고하고 이력을 저장합니다.")
    @PostMapping("/{videoId}/report")
    public ResponseEntity<String> reportVideo(
            @PathVariable("videoId") String videoId,
            @RequestBody ReportRequest request,
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        // 기존에 로그인된 유저 정보를 가져와서 서비스로 넘겨줌
        youtubeReportService.reportVideo(
                userDetail.getUserId(),
                videoId,
                request.getReasonId(),
                request.getSecondaryReasonId(),
                request.getGoogleAccessToken()
        );
        
        return ResponseEntity.ok("신고가 성공적으로 접수되었습니다.");
    }
}
