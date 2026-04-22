package com.ssafy.a405.domain.video.entity;

import com.ssafy.a405.domain.channel.entity.Channel;
import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`영상 기본 정보`")
public class Video extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(length = 255)
    private String title;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "yt_video_id", nullable = false, length = 50)
    private String ytVideoId;

    @Builder
    public Video(Channel channel, String title, String thumbnailUrl, String description, LocalDateTime publishedAt, String ytVideoId) {
        this.channel = channel;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
        this.publishedAt = publishedAt;
        this.ytVideoId = ytVideoId;
    }
}
