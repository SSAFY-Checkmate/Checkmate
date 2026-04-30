package com.ssafy.a405.global.outbox.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.global.outbox.entity.OutboxEvent;
import com.ssafy.a405.global.outbox.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxService {

	private final OutboxEventRepository outboxEventRepository;
	private final ObjectMapper objectMapper;

	@Transactional
	public OutboxEvent enqueue(String topic, String key, Object payloadObject) {
		String payload;
		try {
			payload = objectMapper.writeValueAsString(payloadObject);
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException("Failed to serialize outbox payload", e);
		}

		OutboxEvent event = OutboxEvent.pending(topic, key, payload);
		OutboxEvent saved = outboxEventRepository.save(event);
		log.info("Outbox enqueued. eventId={} topic={} key={}", saved.getEventId(), topic, key);
		return saved;
	}

	@Transactional
	public OutboxEvent enqueueRawJson(String topic, String key, String payloadJson) {
		OutboxEvent event = OutboxEvent.pending(topic, key, payloadJson);
		OutboxEvent saved = outboxEventRepository.save(event);
		log.info("Outbox enqueued(raw). eventId={} topic={} key={}", saved.getEventId(), topic, key);
		return saved;
	}
}

