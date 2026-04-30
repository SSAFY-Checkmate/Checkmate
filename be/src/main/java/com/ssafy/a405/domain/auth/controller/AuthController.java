package com.ssafy.a405.domain.auth.controller;

import com.ssafy.a405.domain.auth.dto.CurrentUserResponse;
import com.ssafy.a405.domain.auth.dto.TokenResponse;
import com.ssafy.a405.domain.auth.security.AccessTokenCookieProvider;
import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.auth.security.RefreshTokenCookieProvider;
import com.ssafy.a405.domain.auth.service.AuthService;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.code.SuccessCode;
import com.ssafy.a405.global.common.dto.ApiResponseBody;
import com.ssafy.a405.global.common.exception.CustomException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "인증", description = "인증 및 사용자 세션 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AccessTokenCookieProvider accessTokenCookieProvider;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;

    @Operation(summary = "토큰 재발급", description = "HttpOnly 리프레시 토큰 쿠키를 사용해 액세스 토큰과 리프레시 토큰을 재발급합니다.")
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponseBody<Void>> reissue(
            @CookieValue(name = RefreshTokenCookieProvider.COOKIE_NAME, required = false) String refreshTokenCookie
    ) {
        String refreshToken = resolveRefreshToken(refreshTokenCookie);
        TokenResponse tokenResponse = authService.reissue(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessTokenCookieProvider.createCookie(tokenResponse.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieProvider.createCookie(tokenResponse.refreshToken()).toString())
                .body(ApiResponseBody.onSuccess(SuccessCode.OK));
    }

    @Operation(summary = "현재 사용자 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponseBody<CurrentUserResponse>> me(
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(
                SuccessCode.OK,
                CurrentUserResponse.from(userDetail)
        ));
    }

    @Operation(summary = "로그아웃", description = "저장된 리프레시 토큰을 삭제하고 리프레시 토큰 쿠키를 만료시킵니다.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponseBody<Void>> logout(
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        authService.logout(userDetail);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessTokenCookieProvider.deleteCookie().toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieProvider.deleteCookie().toString())
                .body(ApiResponseBody.onSuccess(SuccessCode.OK));
    }

    private String resolveRefreshToken(String refreshTokenCookie) {
        if (refreshTokenCookie != null && !refreshTokenCookie.isBlank()) {
            return refreshTokenCookie;
        }

        throw new CustomException(ErrorCode.UNAUTHORIZED);
    }
}
