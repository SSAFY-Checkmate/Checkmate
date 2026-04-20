package com.ssafy.a405.domain.health.controller;

import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health") // 혹은 "/api/health"
public class HealthController {

    @Operation(
            summary = "서버 상태 확인",
            description = "서버가 정상적으로 동작 중인지 확인하기 위한 헬스 체크 API입니다."
    )
    @GetMapping
    public ResponseEntity<ApiResponseBody<String>> healthCheck() {
        // "Health Check OK"라는 문자열을 공통 응답 포맷에 담아 반환
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK,"ok"));
    }
}