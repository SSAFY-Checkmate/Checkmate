package com.ssafy.a405.domain.analysis.entity;

import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`Violation_Details`")
public class ViolationDetail extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysisResult;

    @Column(name = "start_time")
    private Integer startTime;

    @Column(name = "violation_sentence", nullable = false, columnDefinition = "TEXT")
    private String violationSentence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Builder
    public ViolationDetail(AnalysisResult analysisResult, Integer startTime, String violationSentence, String reason) {
        this.analysisResult = analysisResult;
        this.startTime = startTime;
        this.violationSentence = violationSentence;
        this.reason = reason;
    }
}
