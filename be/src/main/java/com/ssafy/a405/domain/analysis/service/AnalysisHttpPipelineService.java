package com.ssafy.a405.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.global.http.ai.AiClient;
import com.ssafy.a405.global.http.parser.ParserClient;
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
	private final AiClient aiClient;
	private final ObjectMapper objectMapper;

	@Async
	public void run(String jobId) {
		long started = System.currentTimeMillis();
		try {
			process(jobId, started, null);
			log.info("[PIPELINE] completed jobId={} elapsedMs={}", jobId, System.currentTimeMillis() - started);
		} catch (Exception e) {
			log.error("[PIPELINE] failed jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
		}
	}

	@Async
	public void runRange(String jobId, double startSeconds, double endSeconds) {
		long started = System.currentTimeMillis();
		try {
			process(jobId, started, SliceOptions.range(startSeconds, endSeconds));
			log.info("[PIPELINE] completed(range) jobId={} elapsedMs={}", jobId, System.currentTimeMillis() - started);
		} catch (Exception e) {
			log.error("[PIPELINE] failed(range) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
		}
	}

	@Async
	public void runAt(String jobId, double atSeconds) {
		long started = System.currentTimeMillis();
		try {
			process(jobId, started, SliceOptions.at(atSeconds));
			log.info("[PIPELINE] completed(at) jobId={} elapsedMs={}", jobId, System.currentTimeMillis() - started);
		} catch (Exception e) {
			log.error("[PIPELINE] failed(at) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
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
			return process(jobId, started, null);
		} catch (Exception e) {
			log.error("[PIPELINE] failed(sync) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
			return null;
		}
	}

	public String runRangeSync(String jobId, double startSeconds, double endSeconds) {
		long started = System.currentTimeMillis();
		try {
			return process(jobId, started, SliceOptions.range(startSeconds, endSeconds));
		} catch (Exception e) {
			log.error("[PIPELINE] failed(sync-range) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
			return null;
		}
	}

	public String runAtSync(String jobId, double atSeconds) {
		long started = System.currentTimeMillis();
		try {
			return process(jobId, started, SliceOptions.at(atSeconds));
		} catch (Exception e) {
			log.error("[PIPELINE] failed(sync-at) jobId={} elapsedMs={} err={}", jobId, System.currentTimeMillis() - started, e.toString(), e);
			analysisJobService.applyFailed(jobId, "PIPELINE_FAILED", e.getMessage());
			return null;
		}
	}

	private String process(String jobId, long startedMs, SliceOptions sliceOptions) throws Exception {
		log.info("[PIPELINE] start jobId={}", jobId);
		analysisJobService.applyTranscriptProcessing(jobId);
		String youtubeUrl = analysisJobService.getJob(jobId).youtubeUrl();
		log.info("[PIPELINE] transcript.request jobId={} url={} mode={}", jobId, youtubeUrl, sliceOptions == null ? "full" : sliceOptions.mode.name().toLowerCase());

		ParserClient.TranscriptResponse transcript;
		SliceOptions usedSliceOptions = sliceOptions;
		if (sliceOptions == null) {
			transcript = parserClient.extractTranscript(youtubeUrl);
		} else if (sliceOptions.mode == SliceMode.RANGE) {
			validateRange(sliceOptions.startSeconds, sliceOptions.endSeconds);
			transcript = parserClient.extractTranscriptRange(youtubeUrl, sliceOptions.startSeconds, sliceOptions.endSeconds);
		} else {
			validateAt(sliceOptions.atSeconds);
			TranscriptAttemptResult attempt = extractTranscriptAtWithFallback(youtubeUrl, sliceOptions.atSeconds, sliceOptions.windowSeconds);
			transcript = attempt.transcript();
			usedSliceOptions = SliceOptions.at(sliceOptions.atSeconds, attempt.usedWindowSeconds());
		}
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
		JsonNode analysisNode = aiClient.analyze(transcript);
		log.info("[PIPELINE] analyze.ok jobId={} trust={} score={}",
			jobId,
			analysisNode.at("/data/trustGrade").asText(null),
			analysisNode.at("/data/confidenceScore").isMissingNode() ? null : analysisNode.at("/data/confidenceScore").asInt()
		);

		Map<String, Object> combined = new LinkedHashMap<>();
		combined.put("pipeline", "http");
		combined.put("occurredAt", Instant.now().toString());
		combined.put("elapsedMs", System.currentTimeMillis() - startedMs);
		if (usedSliceOptions != null) {
			combined.put("request", usedSliceOptions.toRequestMap());
		}
		combined.put("transcript", transcript);
		combined.put("analysis", analysisNode);

		String resultJson = objectMapper.writeValueAsString(combined);
		analysisJobService.applyCompleted(jobId, resultJson);
		return resultJson;
	}

	private void validateRange(double startSeconds, double endSeconds) {
		if (Double.isNaN(startSeconds) || Double.isNaN(endSeconds) || startSeconds < 0 || endSeconds < 0) {
			throw new IllegalArgumentException("Invalid range seconds: startSeconds=" + startSeconds + ", endSeconds=" + endSeconds);
		}
		if (endSeconds < startSeconds) {
			throw new IllegalArgumentException("endSeconds must be >= startSeconds. startSeconds=" + startSeconds + ", endSeconds=" + endSeconds);
		}
	}

	private void validateAt(Double atSeconds) {
		if (atSeconds == null || Double.isNaN(atSeconds) || atSeconds < 0) {
			throw new IllegalArgumentException("Invalid atSeconds: " + atSeconds);
		}
	}

	private TranscriptAttemptResult extractTranscriptAtWithFallback(
		String youtubeUrl,
		double atSeconds,
		double initialWindowSeconds
	) {
		// Heuristic: "at" requests can come back empty due to subtitle boundaries or missing coverage.
		// Retry with a larger window before giving up.
		double[] windows = new double[] {
			initialWindowSeconds,
			Math.max(initialWindowSeconds, 60.0),
			Math.max(initialWindowSeconds, 120.0)
		};

		ParserClient.TranscriptResponse last = null;
		double usedWindow = initialWindowSeconds;
		for (double w : windows) {
			usedWindow = w;
			ParserClient.TranscriptResponse t = parserClient.extractTranscriptAt(youtubeUrl, atSeconds, w);
			last = t;
			if (!isEmptyTranscript(t)) {
				if (w != initialWindowSeconds) {
					log.warn("[PIPELINE] transcript.at.retry-succeeded url={} atSeconds={} windowSeconds={}", youtubeUrl, atSeconds, w);
				}
				return new TranscriptAttemptResult(t, w);
			}
			log.warn("[PIPELINE] transcript.at.empty url={} atSeconds={} windowSeconds={}", youtubeUrl, atSeconds, w);
		}

		throw new IllegalStateException("Empty transcript for atSeconds=" + atSeconds + " after windowSeconds up to " + usedWindow);
	}

	private boolean isEmptyTranscript(ParserClient.TranscriptResponse t) {
		if (t == null) {
			return true;
		}
		boolean contentEmpty = t.content() == null || t.content().trim().isEmpty();
		boolean segmentsEmpty = t.segments() == null || t.segments().isEmpty();
		return contentEmpty && segmentsEmpty;
	}

	private record TranscriptAttemptResult(ParserClient.TranscriptResponse transcript, double usedWindowSeconds) {
	}

	private enum SliceMode {
		RANGE,
		AT
	}

	private static final class SliceOptions {
		private static final double DEFAULT_WINDOW_SECONDS = 30.0;

		private final SliceMode mode;
		private final double startSeconds;
		private final double endSeconds;
		private final Double atSeconds;
		private final double windowSeconds;

		private SliceOptions(SliceMode mode, double startSeconds, double endSeconds, Double atSeconds, double windowSeconds) {
			this.mode = mode;
			this.startSeconds = startSeconds;
			this.endSeconds = endSeconds;
			this.atSeconds = atSeconds;
			this.windowSeconds = windowSeconds;
		}

		static SliceOptions range(double startSeconds, double endSeconds) {
			return new SliceOptions(SliceMode.RANGE, startSeconds, endSeconds, null, 0.0);
		}

		// Default 30s window starting at "atSeconds".
		static SliceOptions at(double atSeconds) {
			return at(atSeconds, DEFAULT_WINDOW_SECONDS);
		}

		static SliceOptions at(double atSeconds, double windowSeconds) {
			return new SliceOptions(SliceMode.AT, atSeconds, atSeconds + windowSeconds, atSeconds, windowSeconds);
		}

		Map<String, Object> toRequestMap() {
			Map<String, Object> m = new LinkedHashMap<>();
			m.put("mode", mode.name().toLowerCase());
			if (mode == SliceMode.AT) {
				m.put("atSeconds", atSeconds);
				m.put("windowSeconds", windowSeconds);
			}
			m.put("startSeconds", startSeconds);
			m.put("endSeconds", endSeconds);
			return m;
		}
	}
}
