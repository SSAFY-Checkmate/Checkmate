package com.ssafy.a405.domain.auth.security;

import com.ssafy.a405.domain.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
public class CustomUserDetail implements UserDetails, OAuth2User {

    private final Long userId;
    private final String email;
    private final String displayName;
    private final String googleSubId;
    private final Map<String, Object> attributes;

    public CustomUserDetail(User user) {
        this(user, Map.of());
    }

    public CustomUserDetail(User user, Map<String, Object> attributes) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.displayName = user.getName();
        this.googleSubId = user.getGoogleSubId();
        this.attributes = attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }
}
