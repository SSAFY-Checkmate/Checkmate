package com.ssafy.a405.global.http.parser;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class ParserClient {

	private final String baseUrl;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public ParserClient(
		ObjectMapper objectMapper,
		@Value("${app.services.parser.base-url:http://localhost:8000}") String baseUrl
	) {
		this.baseUrl = baseUrl;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_1_1)
			.connectTimeout(Duration.ofSeconds(5))
			.followRedirects(HttpClient.Redirect.NORMAL)
			.build();
	}

	public TranscriptResponse extractTranscript(String youtubeUrl) {
		return extractTranscript(youtubeUrl, null, null, null, null);
	}

	public TranscriptResponse extractTranscriptRange(String youtubeUrl, double startSeconds, double endSeconds) {
		return extractTranscript(youtubeUrl, startSeconds, endSeconds, null, null);
	}

	public TranscriptResponse extractTranscriptAt(String youtubeUrl, double atSeconds, double windowSeconds) {
		return extractTranscript(youtubeUrl, null, null, atSeconds, windowSeconds);
	}

	private TranscriptResponse extractTranscript(
		String youtubeUrl,
		Double startSeconds,
		Double endSeconds,
		Double atSeconds,
		Double windowSeconds
	) {
		TranscriptRequest body = new TranscriptRequest(youtubeUrl, startSeconds, endSeconds, atSeconds, windowSeconds);
		String json;
		try {
			json = objectMapper.writeValueAsString(body);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to serialize TranscriptRequest", e);
		}

		String url = baseUrl + "/v1/extract-transcript";
		HttpRequest req = HttpRequest.newBuilder()
			.uri(URI.create(url))
			.timeout(Duration.ofSeconds(60))
			.header("Content-Type", "application/json; charset=utf-8")
			.header("Accept", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
			.build();

		HttpResponse<String> res = send(req);
		if (res.statusCode() / 100 != 2) {
			throw new IllegalStateException("Parser extract-transcript failed. status=" + res.statusCode() + ", body=" + res.body());
		}

		try {
			return objectMapper.readValue(res.body(), TranscriptResponse.class);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to parse parser TranscriptResponse. body=" + res.body(), e);
		}
	}

	public JsonNode analyzeTranscript(AnalysisRequest request) {
		String json;
		try {
			json = objectMapper.writeValueAsString(request);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to serialize AnalysisRequest", e);
		}

		String url = baseUrl + "/v1/analyze-transcript";
		HttpRequest req = HttpRequest.newBuilder()
			.uri(URI.create(url))
			.timeout(Duration.ofSeconds(300))
			.header("Content-Type", "application/json; charset=utf-8")
			.header("Accept", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
			.build();

		HttpResponse<String> res = send(req);
		if (res.statusCode() / 100 != 2) {
			throw new IllegalStateException("Parser analyze-transcript failed. status=" + res.statusCode() + ", body=" + res.body());
		}

		try {
			return objectMapper.readTree(res.body());
		} catch (Exception e) {
			throw new IllegalStateException("Failed to parse parser analyze-transcript response as JSON. body=" + res.body(), e);
		}
	}

	private HttpResponse<String> send(HttpRequest req) {
		try {
			log.debug("Calling parser. method={} uri={}", req.method(), req.uri());
			return httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
		} catch (Exception e) {
			throw new IllegalStateException("Failed to call parser. uri=" + req.uri(), e);
		}
	}

	public record TranscriptRequest(
		@JsonProperty("url") String url,
		@JsonProperty("start_seconds") Double startSeconds,
		@JsonProperty("end_seconds") Double endSeconds,
		@JsonProperty("at_seconds") Double atSeconds,
		@JsonProperty("window_seconds") Double windowSeconds
	) {
	}

	public record AnalysisRequest(
		@JsonProperty("video_id") String videoId,
		String title,
		String author,
		@JsonProperty("channel_id") String channelId,
		String language,
		String content
	) {
		public static AnalysisRequest fromTranscript(TranscriptResponse t) {
			return new AnalysisRequest(t.videoId(), t.title(), t.author(), t.channelId(), t.language(), t.content());
		}
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record TranscriptResponse(
		@JsonProperty("video_id") String videoId,
		String title,
		String author,
		@JsonProperty("channel_id") String channelId,
		String language,
		String content,
		List<Segment> segments,
		String status,
		@JsonProperty("is_whisper") Boolean isWhisper,
		@JsonProperty("processing_time") Double processingTime
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Segment(
		@JsonProperty("start_time") Double startTime,
		String text
	) {
	}
}
