package com.ssafy.a405.domain.report.entity;

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
@Table(name = "`Report_Histories`")
public class ReportHistory extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "video_id", nullable = false, length = 255)
    private String videoId;

    @Column(name = "reason_id", nullable = false, length = 50)
    private String reasonId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    @Builder
    public ReportHistory(User user, String videoId, String reasonId, ReportStatus status) {
        this.user = user;
        this.videoId = videoId;
        this.reasonId = reasonId;
        this.status = status;
    }
}
