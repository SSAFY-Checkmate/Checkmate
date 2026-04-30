package com.ssafy.a405.domain.community.controller;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.community.dto.UserFeedbackCreateRequest;
import com.ssafy.a405.domain.community.dto.UserFeedbackResponse;
import com.ssafy.a405.domain.community.dto.UserFeedbackUpdateRequest;
import com.ssafy.a405.domain.community.service.UserFeedbackService;
import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "커뮤니티 피드백", description = "분석 결과에 대한 사용자 피드백 CRUD API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/feedbacks")
public class UserFeedbackController {

    private final UserFeedbackService userFeedbackService;

    @Operation(summary = "피드백 생성", description = "현재 로그인한 사용자가 특정 분석 결과에 대한 정확성 피드백과 사유를 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponseBody<UserFeedbackResponse>> createUserFeedback(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @Valid @RequestBody UserFeedbackCreateRequest request
    ) {
        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponseBody.onSuccess(SuccessCode.CREATED, userFeedbackService.createUserFeedback(userDetail.getUserId(), request)));
    }

    @Operation(summary = "피드백 단건 조회", description = "피드백 ID로 사용자 피드백 정보를 조회합니다.")
    @GetMapping("/{userFeedbackId}")
    public ResponseEntity<ApiResponseBody<UserFeedbackResponse>> getUserFeedback(@PathVariable Long userFeedbackId) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, userFeedbackService.getUserFeedback(userFeedbackId)));
    }

    @Operation(summary = "피드백 목록 조회", description = "특정 분석 결과에 등록된 사용자 피드백 목록을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponseBody<List<UserFeedbackResponse>>> getUserFeedbacks(@RequestParam Long analysisId) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, userFeedbackService.getUserFeedbacks(analysisId)));
    }

    @Operation(summary = "피드백 수정", description = "현재 로그인한 사용자가 자신이 등록한 피드백의 내용과 정확성 여부를 수정합니다.")
    @PutMapping("/{userFeedbackId}")
    public ResponseEntity<ApiResponseBody<UserFeedbackResponse>> updateUserFeedback(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long userFeedbackId,
            @Valid @RequestBody UserFeedbackUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, userFeedbackService.updateUserFeedback(userDetail.getUserId(), userFeedbackId, request)));
    }

    @Operation(summary = "피드백 삭제", description = "현재 로그인한 사용자가 자신이 등록한 피드백을 삭제합니다.")
    @DeleteMapping("/{userFeedbackId}")
    public ResponseEntity<ApiResponseBody<Void>> deleteUserFeedback(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long userFeedbackId
    ) {
        userFeedbackService.deleteUserFeedback(userDetail.getUserId(), userFeedbackId);
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK));
    }
}
