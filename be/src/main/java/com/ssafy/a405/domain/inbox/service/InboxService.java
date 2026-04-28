package com.ssafy.a405.domain.inbox.service;

import com.ssafy.a405.domain.inbox.entity.InboxEvent;
import com.ssafy.a405.domain.inbox.entity.InboxStatus;
import com.ssafy.a405.domain.inbox.repository.InboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Inbox (consumer-side) dedup skeleton.
 *
 * Kafka is typically at-least-once; this table prevents double-processing when the same event arrives again.
 */
@Service
@RequiredArgsConstructor
public class InboxService {

	private final InboxEventRepository inboxEventRepository;

	/**
	 * Begin processing a message for the given consumer.
	 *
	 * @return true if processing should continue.
	 *         false if this event was already processed and should be ignored.
	 */
	@Transactional
	public boolean beginProcessing(String consumer, String eventId) {
		InboxEvent existing = inboxEventRepository.findByConsumerAndEventId(consumer, eventId).orElse(null);
		if (existing != null) {
			return existing.getStatus() != InboxStatus.PROCESSED;
		}

		try {
			inboxEventRepository.save(InboxEvent.received(consumer, eventId));
			return true;
		} catch (DataIntegrityViolationException e) {
			// Another thread/instance inserted first; decide based on stored status.
			InboxEvent after = inboxEventRepository.findByConsumerAndEventId(consumer, eventId).orElse(null);
			return after == null || after.getStatus() != InboxStatus.PROCESSED;
		}
	}

	@Transactional
	public void markProcessed(String consumer, String eventId) {
		InboxEvent e = inboxEventRepository.findByConsumerAndEventId(consumer, eventId)
			.orElseThrow(() -> new IllegalStateException("InboxEvent missing for consumer=" + consumer + ", eventId=" + eventId));
		e.markProcessed(LocalDateTime.now());
	}

	@Transactional
	public void markFailed(String consumer, String eventId, String errorMessage) {
		InboxEvent e = inboxEventRepository.findByConsumerAndEventId(consumer, eventId)
			.orElse(InboxEvent.received(consumer, eventId));
		e.markFailed(errorMessage);
		inboxEventRepository.save(e);
	}
}
