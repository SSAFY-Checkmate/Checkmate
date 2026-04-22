package com.ssafy.a405.domain.user.entity;

import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`Users`")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "google_sub_id", nullable = false, length = 255)
    private String googleSubId;

    @Builder
    public User(String email, String name, String googleSubId) {
        this.email = email;
        this.name = name;
        this.googleSubId = googleSubId;
    }
}
