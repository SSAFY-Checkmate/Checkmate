package com.ssafy.a405.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "chrome-extension://ofncopcfnmnlagnneoianbbldjglebjh",
                        "https://www.youtube.com"
                )

                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")

                // 허용할 헤더
                .allowedHeaders("*")

                // 브라우저가 노출해도 되는 헤더
                .exposedHeaders("Authorization", "Set-Cookie")

                // 쿠키/인증 정보 포함 여부
                .allowCredentials(true)

                // preflight 캐시 시간(초)
                .maxAge(3600);
    }
}
