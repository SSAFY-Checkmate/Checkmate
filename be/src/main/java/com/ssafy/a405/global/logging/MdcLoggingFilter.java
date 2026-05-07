package com.ssafy.a405.global.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class MdcLoggingFilter extends OncePerRequestFilter {

	public static final String MDC_TRACE_ID = "traceId";
	public static final String MDC_USER_ID = "userId";
	public static final String MDC_METHOD = "method";
	public static final String MDC_PATH = "path";

	private static final String HEADER_TRACE_ID = "X-Trace-Id";
	private static final String HEADER_REQUEST_ID = "X-Request-Id";

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String traceId = firstNonBlank(request.getHeader(HEADER_TRACE_ID), request.getHeader(HEADER_REQUEST_ID));
		if (traceId == null) {
			traceId = UUID.randomUUID().toString();
		}

		MDC.put(MDC_TRACE_ID, traceId);
		MDC.put(MDC_METHOD, request.getMethod());
		MDC.put(MDC_PATH, request.getRequestURI());

		String userId = resolveUserId();
		if (userId != null) {
			MDC.put(MDC_USER_ID, userId);
		}

		// Propagate for clients / gateway logs.
		response.setHeader(HEADER_TRACE_ID, traceId);

		try {
			filterChain.doFilter(request, response);
		} finally {
			MDC.clear();
		}
	}

	private String resolveUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}
		String name = authentication.getName();
		if (name == null || name.isBlank() || "anonymousUser".equalsIgnoreCase(name)) {
			return null;
		}
		return name;
	}

	private String firstNonBlank(String a, String b) {
		if (a != null && !a.isBlank()) return a.trim();
		if (b != null && !b.isBlank()) return b.trim();
		return null;
	}
}

