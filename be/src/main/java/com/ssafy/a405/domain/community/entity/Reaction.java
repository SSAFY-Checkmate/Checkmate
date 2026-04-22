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
@Table(name = "`Reactions`")
public class Reaction extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysisResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reaction_type")
    private Boolean reactionType; // 1 - like, 0 - dislike

    @Builder
    public Reaction(AnalysisResult analysisResult, User user, Boolean reactionType) {
        this.analysisResult = analysisResult;
        this.user = user;
        this.reactionType = reactionType;
    }
}
