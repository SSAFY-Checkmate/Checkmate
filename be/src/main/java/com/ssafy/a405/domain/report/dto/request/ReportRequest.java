package com.ssafy.a405.domain.report.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportRequest {
    private String reasonId;
    private String secondaryReasonId;
    private String googleAccessToken;
}
