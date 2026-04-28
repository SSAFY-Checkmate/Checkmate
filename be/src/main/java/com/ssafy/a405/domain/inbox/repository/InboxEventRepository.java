package com.ssafy.a405.domain.inbox.repository;

import com.ssafy.a405.domain.inbox.entity.InboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InboxEventRepository extends JpaRepository<InboxEvent, Long> {
	boolean existsByConsumerAndEventId(String consumer, String eventId);
	Optional<InboxEvent> findByConsumerAndEventId(String consumer, String eventId);
}
