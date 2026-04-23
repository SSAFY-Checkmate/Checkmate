package com.ssafy.a405.domain.auth.service;

import com.ssafy.a405.domain.auth.dto.TokenResponse;
import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.auth.security.JwtProperties;
import com.ssafy.a405.domain.auth.security.JwtTokenProvider;
import com.ssafy.a405.domain.auth.security.TokenStore;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import com.ssafy.a405.global.common.code.ErrorCode;
import com.ssafy.a405.global.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final TokenStore tokenStore;

    @Transactional(readOnly = true)
    public CustomUserDetail loadUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return new CustomUserDetail(user);
    }

    public TokenResponse issueToken(CustomUserDetail userDetail) {
        String accessToken = jwtTokenProvider.createAccessToken(userDetail);
        String refreshToken = jwtTokenProvider.createRefreshToken(userDetail);

        tokenStore.saveRefreshToken(
                userDetail.getUserId(),
                refreshToken,
                Duration.ofMillis(jwtProperties.refreshTokenExpirationMillis())
        );

        return TokenResponse.bearer(accessToken, refreshToken);
    }

    public TokenResponse reissue(String refreshToken) {
        Long userId = jwtTokenProvider.getUserId(refreshToken);
        String savedRefreshToken = tokenStore.getRefreshToken(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED));

        if (!savedRefreshToken.equals(refreshToken)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        CustomUserDetail userDetail = loadUserDetail(userId);
        return issueToken(userDetail);
    }

    public void logout(CustomUserDetail userDetail) {
        tokenStore.deleteRefreshToken(userDetail.getUserId());
    }
}
