package com.ssafy.a405.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("A405 API Docs")
                .description("""
                    SSAFY 14기 A405 프로젝트 API 문서입니다.
            
                    ### 사용 안내
                    - 모든 API 응답은 `ApiResponseBody` 공통 규격을 따릅니다.
                    - 인증이 필요한 API는 오른쪽 'Authorize' 버튼을 눌러 Access Token을 입력해 주세요.
                    """)
                .version("v1.0.0")
                .contact(new Contact().name("A405 Team"));

        List<Server> servers = List.of(
                new Server().url("http://localhost:8080").description("local"),
                new Server().url("https://k14a405.p.ssafy.io/be").description("prod")
        );

        String jwtSchemeName = "bearerAuth";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));

        return new OpenAPI()
                .info(info)
                .servers(servers)
                .addSecurityItem(securityRequirement)
                .components(components);
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("all-api")
                .packagesToScan("com.ssafy.a405.domain")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth")
                .packagesToScan("com.ssafy.a405.domain.auth")
                .build();
    }

    @Bean
    public GroupedOpenApi healthApi() {
        return GroupedOpenApi.builder()
                .group("health")
                .packagesToScan("com.ssafy.a405.domain.health")
                .build();
    }

    @Bean
    public GroupedOpenApi analysisApi() {
        return GroupedOpenApi.builder()
                .group("analysis")
                .packagesToScan("com.ssafy.a405.domain.analysis")
                .build();
    }
}

