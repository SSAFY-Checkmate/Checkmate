package com.ssafy.a405.domain.community.controller;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.community.dto.ReactionCreateRequest;
import com.ssafy.a405.domain.community.dto.ReactionResponse;
import com.ssafy.a405.domain.community.dto.ReactionUpdateRequest;
import com.ssafy.a405.domain.community.service.ReactionService;
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

@Tag(name = "커뮤니티 반응", description = "분석 결과에 대한 사용자 반응 CRUD API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    @Operation(summary = "반응 생성", description = "현재 로그인한 사용자가 특정 분석 결과에 대해 좋아요 또는 싫어요 반응을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponseBody<ReactionResponse>> createReaction(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @Valid @RequestBody ReactionCreateRequest request
    ) {
        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponseBody.onSuccess(SuccessCode.CREATED, reactionService.createReaction(userDetail.getUserId(), request)));
    }

    @Operation(summary = "반응 단건 조회", description = "반응 ID로 사용자 반응 정보를 조회합니다.")
    @GetMapping("/{reactionId}")
    public ResponseEntity<ApiResponseBody<ReactionResponse>> getReaction(@PathVariable Long reactionId) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, reactionService.getReaction(reactionId)));
    }

    @Operation(summary = "반응 목록 조회", description = "특정 분석 결과에 등록된 반응 목록을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponseBody<List<ReactionResponse>>> getReactions(@RequestParam Long analysisId) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, reactionService.getReactions(analysisId)));
    }

    @Operation(summary = "반응 수정", description = "현재 로그인한 사용자가 자신이 등록한 반응의 종류를 수정합니다.")
    @PutMapping("/{reactionId}")
    public ResponseEntity<ApiResponseBody<ReactionResponse>> updateReaction(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long reactionId,
            @Valid @RequestBody ReactionUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, reactionService.updateReaction(userDetail.getUserId(), reactionId, request)));
    }

    @Operation(summary = "반응 삭제", description = "현재 로그인한 사용자가 자신이 등록한 반응을 삭제합니다.")
    @DeleteMapping("/{reactionId}")
    public ResponseEntity<ApiResponseBody<Void>> deleteReaction(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long reactionId
    ) {
        reactionService.deleteReaction(userDetail.getUserId(), reactionId);
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK));
    }
}
