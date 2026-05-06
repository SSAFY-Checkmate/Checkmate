package com.ssafy.a405.global.http.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.global.http.parser.ParserClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Component
public class AiClient {

	private final String baseUrl;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public AiClient(
		ObjectMapper objectMapper,
		@Value("${app.services.ai.base-url:http://localhost:8001}") String baseUrl
	) {
		this.baseUrl = baseUrl;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_1_1)
			.connectTimeout(Duration.ofSeconds(5))
			.followRedirects(HttpClient.Redirect.NORMAL)
			.build();
	}

	/**
	 * Calls AI server synchronously:
	 * POST {baseUrl}/analyze/run
	 *
	 * Request body: parser transcript JSON (as-is)
	 * Response body: server-defined envelope JSON
	 */
	public JsonNode analyze(ParserClient.TranscriptResponse transcript) {
		String json;
		try {
			json = objectMapper.writeValueAsString(transcript);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to serialize transcript for AI analyze/run", e);
		}

		String url = baseUrl + "/analyze/run";
		HttpRequest req = HttpRequest.newBuilder()
			.uri(URI.create(url))
			.timeout(Duration.ofSeconds(300))
			.header("Content-Type", "application/json; charset=utf-8")
			.header("Accept", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
			.build();

		HttpResponse<String> res = send(req);
		if (res.statusCode() / 100 != 2) {
			throw new IllegalStateException("AI analyze/run failed. status=" + res.statusCode() + ", body=" + res.body());
		}

		try {
			return objectMapper.readTree(res.body());
		} catch (Exception e) {
			throw new IllegalStateException("Failed to parse AI analyze/run response as JSON. body=" + res.body(), e);
		}
	}

	private HttpResponse<String> send(HttpRequest req) {
		try {
			log.debug("Calling ai. method={} uri={}", req.method(), req.uri());
			return httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
		} catch (Exception e) {
			throw new IllegalStateException("Failed to call ai. uri=" + req.uri(), e);
		}
	}
}

