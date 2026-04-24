package com.ssafy.a405.global.outbox.controller;

import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import com.ssafy.a405.global.outbox.dto.OutboxEventResponse;
import com.ssafy.a405.global.outbox.entity.OutboxStatus;
import com.ssafy.a405.global.outbox.service.OutboxAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin API for Outbox operations.
 *
 * NOTE: This endpoint should be protected (auth/IP allowlist) in production.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/outbox")
public class OutboxAdminController {

	private final OutboxAdminService outboxAdminService;

	@GetMapping("/events")
	public ResponseEntity<ApiResponseBody<List<OutboxEventResponse>>> list(
		@RequestParam OutboxStatus status,
		@RequestParam(defaultValue = "50") int limit
	) {
		List<OutboxEventResponse> data = outboxAdminService.list(status, Math.min(Math.max(limit, 1), 500))
			.stream()
			.map(OutboxEventResponse::from)
			.toList();
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, data));
	}

	@PostMapping("/events/{eventId}/retry")
	public ResponseEntity<ApiResponseBody<OutboxEventResponse>> retry(@PathVariable String eventId) {
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, OutboxEventResponse.from(outboxAdminService.retry(eventId))));
	}

	@PostMapping("/events/retry-dead")
	public ResponseEntity<ApiResponseBody<Integer>> retryDead(@RequestParam(defaultValue = "50") int limit) {
		int retried = outboxAdminService.retryDead(Math.min(Math.max(limit, 1), 500));
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK, retried));
	}

	@DeleteMapping("/events/{eventId}")
	public ResponseEntity<ApiResponseBody<Void>> delete(@PathVariable String eventId) {
		outboxAdminService.delete(eventId);
		return ResponseEntity.ok(ApiResponseBody.onSuccess(SuccessCode.OK));
	}
}

