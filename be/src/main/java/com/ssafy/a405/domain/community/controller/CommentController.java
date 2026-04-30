package com.ssafy.a405.domain.community.controller;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.community.dto.CommentCreateRequest;
import com.ssafy.a405.domain.community.dto.CommentPageResponse;
import com.ssafy.a405.domain.community.dto.CommentResponse;
import com.ssafy.a405.domain.community.dto.CommentUpdateRequest;
import com.ssafy.a405.domain.community.service.CommentService;
import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

@Tag(name = "커뮤니티 댓글", description = "분석 결과에 대한 사용자 댓글 CRUD API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/comments")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 생성", description = "현재 로그인한 사용자가 특정 분석 결과에 댓글을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponseBody<CommentResponse>> createComment(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponseBody.onSuccess(SuccessCode.CREATED, commentService.createComment(userDetail.getUserId(), request)));
    }

    @Operation(summary = "댓글 단건 조회", description = "댓글 ID로 댓글 정보를 조회합니다.")
    @GetMapping("/{commentId}")
    public ResponseEntity<ApiResponseBody<CommentResponse>> getComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, commentService.getComment(commentId)));
    }

    @Operation(summary = "댓글 목록 조회", description = "특정 분석 결과에 등록된 댓글 목록을 10개씩 페이지 단위로 최신순 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponseBody<CommentPageResponse>> getComments(
            @Parameter(description = "분석 결과 ID", example = "1")
            @RequestParam Long analysisId,
            @Parameter(description = "조회할 페이지 번호, 0부터 시작합니다.", example = "0")
            @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, commentService.getComments(analysisId, page)));
    }

    @Operation(summary = "댓글 수정", description = "현재 로그인한 사용자가 자신이 작성한 댓글 내용을 수정합니다.")
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponseBody<CommentResponse>> updateComment(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, commentService.updateComment(userDetail.getUserId(), commentId, request)));
    }

    @Operation(summary = "댓글 삭제", description = "현재 로그인한 사용자가 자신이 작성한 댓글을 삭제합니다.")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponseBody<Void>> deleteComment(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(userDetail.getUserId(), commentId);
        return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK));
    }
}
