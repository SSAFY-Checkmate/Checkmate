package com.ssafy.a405.global.common.exception;



import com.ssafy.a405.global.common.code.BaseCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomException extends RuntimeException {
    private final BaseCode errorStatus;
}
