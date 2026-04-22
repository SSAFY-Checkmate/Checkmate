package com.ssafy.a405.domain.video.entity;

import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`유튜브 원본 댓글 AI 분석`")
public class YoutubeCommentAnalysis extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "summary_text", columnDefinition = "TEXT")
    private String summaryText;

    @Column(name = "sentiment_ratio_positive")
    private Integer sentimentRatioPositive;

    @Column(name = "sentiment_ratio_negative")
    private Integer sentimentRatioNegative;

    @Builder
    public YoutubeCommentAnalysis(Video video, String summaryText, Integer sentimentRatioPositive, Integer sentimentRatioNegative) {
        this.video = video;
        this.summaryText = summaryText;
        this.sentimentRatioPositive = sentimentRatioPositive;
        this.sentimentRatioNegative = sentimentRatioNegative;
    }
}
