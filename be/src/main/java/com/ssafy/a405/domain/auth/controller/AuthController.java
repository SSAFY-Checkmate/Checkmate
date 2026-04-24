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

@Tag(name = "Auth", description = "Authentication API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AccessTokenCookieProvider accessTokenCookieProvider;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;

    @Operation(summary = "Reissue token", description = "Reissues tokens using the HttpOnly refresh token cookie.")
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

    @Operation(summary = "Current user", description = "Returns the current authenticated user.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponseBody<CurrentUserResponse>> me(
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        return ResponseEntity.ok(ApiResponseBody.onSuccess(
                SuccessCode.OK,
                CurrentUserResponse.from(userDetail)
        ));
    }

    @Operation(summary = "Logout", description = "Deletes the saved refresh token and expires the refresh token cookie.")
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
