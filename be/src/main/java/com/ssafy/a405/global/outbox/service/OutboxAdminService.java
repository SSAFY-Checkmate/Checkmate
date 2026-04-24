package com.ssafy.a405.global.outbox.service;

import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import com.ssafy.a405.global.outbox.entity.OutboxEvent;
import com.ssafy.a405.global.outbox.entity.OutboxStatus;
import com.ssafy.a405.global.outbox.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OutboxAdminService {

	private final OutboxEventRepository outboxEventRepository;

	@Transactional(readOnly = true)
	public List<OutboxEvent> list(OutboxStatus status, int limit) {
		return outboxEventRepository.findByStatusOrderByCreatedAtAsc(status, PageRequest.of(0, limit));
	}

	@Transactional
	public OutboxEvent retry(String eventId) {
		OutboxEvent event = outboxEventRepository.findById(eventId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
		event.resetToPending();
		return event;
	}

	@Transactional
	public int retryDead(int limit) {
		List<OutboxEvent> dead = outboxEventRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.DEAD, PageRequest.of(0, limit));
		for (OutboxEvent e : dead) {
			e.resetToPending();
		}
		return dead.size();
	}

	@Transactional
	public void delete(String eventId) {
		if (!outboxEventRepository.existsById(eventId)) {
			throw new CustomException(ErrorCode.NOT_FOUND);
		}
		outboxEventRepository.deleteById(eventId);
	}
}

