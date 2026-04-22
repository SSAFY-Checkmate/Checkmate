package com.ssafy.a405.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TrustGrade {
    GOOD("양호"),
    WARNING("주의"),
    DANGER("위험"),
    UNKNOWN("판단불가");

    private final String description;
}
