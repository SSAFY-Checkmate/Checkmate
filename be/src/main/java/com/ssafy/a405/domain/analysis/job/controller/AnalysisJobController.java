package com.ssafy.a405.domain.analysis.job.controller;

import com.ssafy.a405.domain.analysis.job.dto.AnalysisJobCreateRequest;
import com.ssafy.a405.domain.analysis.job.dto.AnalysisJobCreateResponse;
import com.ssafy.a405.domain.analysis.job.dto.AnalysisJobGetResponse;
import com.ssafy.a405.domain.analysis.job.entity.AnalysisJob;
import com.ssafy.a405.domain.analysis.job.service.AnalysisJobService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/analysis")
public class AnalysisJobController {

	private final AnalysisJobService analysisJobService;

	@PostMapping
	public ResponseEntity<ApiResponseBody<AnalysisJobCreateResponse>> requestAnalysis(
		@Valid @RequestBody AnalysisJobCreateRequest request
	) {
		AnalysisJob job = analysisJobService.createRequestedJob(request.youtubeUrl());
		AnalysisJobCreateResponse response = new AnalysisJobCreateResponse(job.getJobId(), job.getStatus());
		return ResponseEntity
			.status(SuccessCode.ACCEPTED.getHttpStatus())
			.body(ApiResponseBody.onSuccess(SuccessCode.ACCEPTED, response));
	}

	@GetMapping("/{jobId}")
	public ResponseEntity<ApiResponseBody<AnalysisJobGetResponse>> getAnalysisJob(@PathVariable String jobId) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, analysisJobService.getJob(jobId)));
	}
}

