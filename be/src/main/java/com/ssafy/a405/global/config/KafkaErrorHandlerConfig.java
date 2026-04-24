package com.ssafy.a405.global.config;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.TopicPartition;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.util.backoff.FixedBackOff;

/**
 * Consumer-side retry + DLQ.
 *
 * - Retries happen with a fixed backoff.
 * - After retries are exhausted, the record is published to <originalTopic><suffix>.
 */
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.pipeline.mode", havingValue = "kafka")
public class KafkaErrorHandlerConfig {

	private final KafkaTemplate<String, String> kafkaTemplate;

	@Value("${kafka.dlq.suffix:.dlq}")
	private String dlqSuffix;

	@Value("${kafka.retry.interval-ms:1000}")
	private long retryIntervalMs;

	@Value("${kafka.retry.max-attempts:3}")
	private long maxAttempts;

	@Bean
	public DefaultErrorHandler kafkaErrorHandler() {
		DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
			kafkaTemplate,
			(record, ex) -> new TopicPartition(record.topic() + dlqSuffix, record.partition())
		);

		DefaultErrorHandler handler = new DefaultErrorHandler(
			recoverer,
			// maxAttempts here is number of retries; FixedBackOff expects "maxAttempts"
			new FixedBackOff(retryIntervalMs, Math.max(0, maxAttempts))
		);

		// Configuration note: add domain-specific non-retryable exceptions here if needed.
		return handler;
	}
}
