package com.ssafy.a405.domain.analysis.controller;

import com.ssafy.a405.domain.analysis.dto.AnalysisCheckResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobCreateRequest;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobCreateResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.dto.AnalysisReportResponse;
import com.ssafy.a405.domain.analysis.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.service.AnalysisJobOrchestrator;
import com.ssafy.a405.domain.analysis.service.AnalysisJobService;
import com.ssafy.a405.domain.analysis.service.AnalysisService;
import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/analysis")
public class AnalysisJobController {

	private final AnalysisJobService analysisJobService;
	private final AnalysisJobOrchestrator analysisJobOrchestrator;
	private final AnalysisService analysisService;

	@PostMapping
	public ResponseEntity<ApiResponseBody<AnalysisJobCreateResponse>> requestAnalysis(
		@Valid @RequestBody AnalysisJobCreateRequest request
	) {
		AnalysisJob job = analysisJobOrchestrator.requestAnalysisAsync(request.youtubeUrl());
		AnalysisJobCreateResponse response = new AnalysisJobCreateResponse(job.getJobId(), job.getStatus());
		return ResponseEntity
			.status(SuccessCode.ACCEPTED.getHttpStatus())
			.body(ApiResponseBody.onSuccess(SuccessCode.ACCEPTED, response));
	}

	@PostMapping("/sync")
	public ResponseEntity<ApiResponseBody<AnalysisJobGetResponse>> requestAnalysisSync(
		@Valid @RequestBody AnalysisJobCreateRequest request
	) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisJobOrchestrator.requestAnalysisSync(request.youtubeUrl())));
	}

	@GetMapping("/{jobId}")
	public ResponseEntity<ApiResponseBody<AnalysisJobGetResponse>> getAnalysisJob(@PathVariable String jobId) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisJobService.getJob(jobId)));
	}

	@GetMapping("/latest")
	public ResponseEntity<ApiResponseBody<AnalysisJobGetResponse>> getLatestByYoutubeUrl(
		@RequestParam String youtubeUrl
	) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisJobService.getLatestJobByYoutubeUrl(youtubeUrl)));
	}

	@GetMapping("/check")
	public ResponseEntity<ApiResponseBody<AnalysisCheckResponse>> checkAnalysis(
		@RequestParam String youtubeUrl
	) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisJobService.checkAnalysisStatus(youtubeUrl)));
	}
	@GetMapping("/{jobId}/result")
	public ResponseEntity<ApiResponseBody<AnalysisReportResponse>> getAnalysisResult(@PathVariable String jobId) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisService.getAnalysisResult(jobId)));
	}

}

