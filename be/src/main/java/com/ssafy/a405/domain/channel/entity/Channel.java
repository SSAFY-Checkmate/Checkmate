package com.ssafy.a405.domain.channel.entity;

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
@Table(name = "`채널 메타데이터`")
public class Channel extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_name", length = 255)
    private String channelName;

    @Enumerated(EnumType.STRING)
    @Column(name = "trust_grade", length = 100)
    private TrustGrade trustGrade;

    @Column(name = "total_violation_count")
    private Integer totalViolationCount;

    @Column(name = "yt_channel_id", nullable = false, length = 100)
    private String ytChannelId;

    @Builder
    public Channel(String channelName, TrustGrade trustGrade, Integer totalViolationCount, String ytChannelId) {
        this.channelName = channelName;
        this.trustGrade = trustGrade;
        this.totalViolationCount = totalViolationCount;
        this.ytChannelId = ytChannelId;
    }
}
