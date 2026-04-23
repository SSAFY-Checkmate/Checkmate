package com.ssafy.a405.domain.auth.dto;

public record AccessTokenResponse(
        String grantType,
        String accessToken
) {

    public static AccessTokenResponse bearer(String accessToken) {
        return new AccessTokenResponse("Bearer", accessToken);
    }
}
