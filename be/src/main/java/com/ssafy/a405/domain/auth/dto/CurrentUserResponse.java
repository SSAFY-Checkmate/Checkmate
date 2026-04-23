package com.ssafy.a405.domain.auth.dto;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "현재 사용자 정보 응답")
public record CurrentUserResponse(
        @Schema(description = "사용자 ID", example = "1")
        Long userId,
        @Schema(description = "이메일", example = "ssafy@ssafy.com")
        String email,
        @Schema(description = "이름", example = "김싸피")
        String name
) {

    public static CurrentUserResponse from(CustomUserDetail userDetail) {
        return new CurrentUserResponse(
                userDetail.getUserId(),
                userDetail.getEmail(),
                userDetail.getDisplayName()
        );
    }
}
