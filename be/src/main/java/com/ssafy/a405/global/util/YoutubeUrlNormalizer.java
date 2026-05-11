package com.ssafy.a405.global.util;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Best-effort canonicalization so the same YouTube video maps to one stored URL.
 *
 * This is intentionally conservative; if parsing fails, it returns the trimmed input.
 */
public final class YoutubeUrlNormalizer {

	private YoutubeUrlNormalizer() {
	}

	public static String normalize(String input) {
		String videoId = extractVideoId(input);
		if (videoId == null || videoId.isBlank()) {
			return input == null ? null : input.trim();
		}
		return "https://www.youtube.com/watch?v=" + videoId;
	}

	public static String extractVideoId(String input) {
		if (input == null) {
			return null;
		}

		String raw = input.trim();
		if (raw.isEmpty()) {
			return null;
		}

		String candidate = raw;
		if (!candidate.contains("://")) {
			candidate = "https://" + candidate;
		}

		try {
			URI uri = URI.create(candidate);
			String host = uri.getHost();
			if (host == null) {
				return null;
			}

			host = host.toLowerCase();
			String videoId = null;

			if (host.endsWith("youtu.be")) {
				// https://youtu.be/<id>
				String path = uri.getPath();
				if (path != null) {
					String p = path.startsWith("/") ? path.substring(1) : path;
					videoId = firstSegment(p);
				}
			} else if (host.contains("youtube.com")) {
				String path = uri.getPath() == null ? "" : uri.getPath();
				if (path.startsWith("/watch")) {
					videoId = queryParam(uri.getQuery(), "v");
				} else if (path.startsWith("/shorts/")) {
					videoId = firstSegment(path.substring("/shorts/".length()));
				} else if (path.startsWith("/embed/")) {
					videoId = firstSegment(path.substring("/embed/".length()));
				} else {
					// Fallback: try v= in query anyway
					videoId = queryParam(uri.getQuery(), "v");
				}
			}

			return videoId;
		} catch (Exception ignored) {
			return null;
		}
	}

	private static String firstSegment(String s) {
		if (s == null) {
			return null;
		}
		int q = s.indexOf('?');
		String noQuery = q >= 0 ? s.substring(0, q) : s;
		int slash = noQuery.indexOf('/');
		return slash >= 0 ? noQuery.substring(0, slash) : noQuery;
	}

	private static String queryParam(String query, String key) {
		if (query == null || query.isBlank()) {
			return null;
		}
		for (String part : query.split("&")) {
			int eq = part.indexOf('=');
			if (eq <= 0) {
				continue;
			}
			String k = decode(part.substring(0, eq));
			if (!key.equalsIgnoreCase(k)) {
				continue;
			}
			return decode(part.substring(eq + 1));
		}
		return null;
	}

	private static String decode(String s) {
		try {
			return URLDecoder.decode(s, StandardCharsets.UTF_8);
		} catch (Exception ignored) {
			return s;
		}
	}
}

