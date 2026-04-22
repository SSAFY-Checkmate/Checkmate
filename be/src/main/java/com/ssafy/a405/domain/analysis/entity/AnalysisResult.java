package com.ssafy.a405.domain.analysis.entity;

import com.ssafy.a405.domain.video.entity.Video;
import com.ssafy.a405.global.common.base.BaseTimeEntity;
import com.ssafy.a405.global.common.enums.TrustGrade;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`검증 결과`")
public class AnalysisResult extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "confidence_score", nullable = false, columnDefinition = "TINYINT")
    private Integer confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrustGrade status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "model_version", nullable = false, length = 100)
    private String modelVersion;

    @Builder
    public AnalysisResult(Video video, Integer confidenceScore, TrustGrade status, String summary, String modelVersion) {
        this.video = video;
        this.confidenceScore = confidenceScore;
        this.status = status;
        this.summary = summary;
        this.modelVersion = modelVersion;
    }
}
