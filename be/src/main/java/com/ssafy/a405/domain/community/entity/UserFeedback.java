package com.ssafy.a405.domain.community.entity;

import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.global.common.base.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "`User_Feedbacks`")
public class UserFeedback extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysisResult;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Builder
    public UserFeedback(User user, AnalysisResult analysisResult, String reason, Boolean isCorrect) {
        this.user = user;
        this.analysisResult = analysisResult;
        this.reason = reason;
        this.isCorrect = isCorrect;
    }

    public void updateFeedback(String reason, Boolean isCorrect) {
        this.reason = reason;
        this.isCorrect = isCorrect;
    }
}
