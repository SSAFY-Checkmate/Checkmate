package com.ssafy.a405.global.outbox.repository;

import com.ssafy.a405.global.outbox.entity.OutboxEvent;
import com.ssafy.a405.global.outbox.entity.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

	@Query("""
		select e
		from OutboxEvent e
		where e.status = :status
		order by e.createdAt asc
		""")
	List<OutboxEvent> findPendingForUpdate(@Param("status") OutboxStatus status, Pageable pageable);

	List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status, Pageable pageable);

	/**
	 * MySQL 8+ recommended query for multi-instance publishers.
	 * It avoids multiple publishers selecting the same rows by skipping locked rows.
	 */
	@Query(
		value = """
			select *
			from outbox_event
			where status = 'PENDING'
			order by created_at asc
			limit :limit
			for update skip locked
			""",
		nativeQuery = true
	)
	List<OutboxEvent> findPendingSkipLocked(@Param("limit") int limit);

	@Modifying
	@Query(
		value = """
			update outbox_event
			set status = 'PENDING'
			where status = 'PROCESSING'
			  and updated_at < date_sub(now(), interval :timeoutSeconds second)
			""",
		nativeQuery = true
	)
	int resetStuckProcessing(@Param("timeoutSeconds") long timeoutSeconds);
}
