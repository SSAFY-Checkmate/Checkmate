package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.http.ParserClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisHttpPipelineService {

	private final AnalysisJobService analysisJobService;
	private final ParserClient parserClient;
	private final ObjectMapper objectMapper;

	@Async
	public void run(String jobId) {
		long started = System.currentTimeMillis();
		try {
			process(jobId, started);
			log.info("[PIPELINE] completed jobId={} elapsedMs={}", jobId, System.currentTimeMillis() - started);
		} catch (Exception e) {
			log.warn("[PIPELINE] failed jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
		}
	}

	/**
	 * Synchronous variant for immediate front-end response.
	 *
	 * Returns the final stored JSON string (also persisted to the job).
	 */
	public String runSync(String jobId) {
		long started = System.currentTimeMillis();
		try {
			return process(jobId, started);
		} catch (Exception e) {
			log.warn("[PIPELINE] failed(sync) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
			return null;
		}
	}

	private String process(String jobId, long startedMs) throws Exception {
		log.info("[PIPELINE] start jobId={}", jobId);
		analysisJobService.applyTranscriptProcessing(jobId);
		String youtubeUrl = analysisJobService.getJob(jobId).youtubeUrl();
		log.info("[PIPELINE] transcript.request jobId={} url={}", jobId, youtubeUrl);
		ParserClient.TranscriptResponse transcript = parserClient.extractTranscript(youtubeUrl);
			log.info(
				"[PIPELINE] transcript.ok jobId={} videoId={} channelId={} lang={} contentChars={} whisper={} processingTime={}s",
				jobId,
				transcript.videoId(),
				transcript.channelId(),
				transcript.language(),
				transcript.content() == null ? 0 : transcript.content().length(),
				transcript.isWhisper(),
				transcript.processingTime()
			);

		analysisJobService.applyProcessing(jobId);

		log.info("[PIPELINE] analyze.request jobId={}", jobId);
		JsonNode analysisNode = parserClient.analyzeTranscript(
			ParserClient.AnalysisRequest.fromTranscript(transcript)
		);
		log.info("[PIPELINE] analyze.ok jobId={} trust={} score={} model={}",
			jobId,
			analysisNode.at("/analysisResult/trustGrade").isMissingNode()
				? analysisNode.at("/trustGrade").asText(null)
				: analysisNode.at("/analysisResult/trustGrade").asText(null),
			analysisNode.at("/analysisResult/confidenceScore").isMissingNode()
				? (analysisNode.at("/confidenceScore").isMissingNode() ? null : analysisNode.at("/confidenceScore").asInt())
				: analysisNode.at("/analysisResult/confidenceScore").asInt(),
			analysisNode.at("/analysisResult/modelVersion").isMissingNode()
				? analysisNode.at("/modelVersion").asText(null)
				: analysisNode.at("/analysisResult/modelVersion").asText(null)
		);

		Map<String, Object> combined = new LinkedHashMap<>();
		combined.put("pipeline", "http");
		combined.put("occurredAt", Instant.now().toString());
		combined.put("elapsedMs", System.currentTimeMillis() - startedMs);
		combined.put("transcript", transcript);
		combined.put("analysis", analysisNode);

		String resultJson = objectMapper.writeValueAsString(combined);
		analysisJobService.applyCompleted(jobId, resultJson);
		return resultJson;
	}
}
