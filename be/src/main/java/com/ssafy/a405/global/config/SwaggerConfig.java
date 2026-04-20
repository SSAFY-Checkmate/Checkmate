package com.ssafy.a405.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
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
                .title("A405 API")
                .description("""
                    SSAFY 프로젝트 API 문서입니다.
            
                    ### API Groups (Alphabetical Order)
                    - health: api 테스트 체크용
                    """)
                .version("v1.0.0")
                .contact(new Contact().name("A509 Team"));

        List<Server> servers = List.of(
                new Server().url("http://localhost:8080").description("local"),
                new Server().url("나중에배포주소넣기").description("prod")
        );

        String jwtSchemeName = "bearerAuth";

        return new OpenAPI()
                .info(info)
                .servers(servers);
    }

//    도메인별 Swagger 그룹핑

    @Bean
    public GroupedOpenApi globalApi() {
        return GroupedOpenApi.builder()
                .group("health")
                .packagesToScan("com.ssafy.a405.domain.health")
                .build();
    }

}
