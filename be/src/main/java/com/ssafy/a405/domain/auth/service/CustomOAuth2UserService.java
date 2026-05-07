package com.ssafy.a405.domain.auth.service;

import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();

        String googleSubId = String.valueOf(attributes.get("sub"));
        String email = String.valueOf(attributes.get("email"));
        String name = String.valueOf(attributes.get("name"));

        User existing = userRepository.findByGoogleSubId(googleSubId).orElse(null);
        final boolean isNew;
        final User user;
        if (existing != null) {
            existing.updateProfile(email, name);
            user = existing;
            isNew = false;
        } else {
            user = userRepository.save(User.builder()
                .email(email)
                .name(name)
                .googleSubId(googleSubId)
                .build());
            isNew = true;
        }

        // Avoid logging email; keep security events traceable.
        log.info("auth.oauth2_user_upsert provider=google userId={} isNew={}", user.getId(), isNew);

        return new CustomUserDetail(user, attributes);
    }
}
