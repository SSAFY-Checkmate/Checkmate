package com.ssafy.a405.global.config;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerUiController {

    @GetMapping(value = "/swagger-ui/swagger-initializer.js", produces = "application/javascript")
    public ResponseEntity<String> swaggerInitializer() {
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("application/javascript"))
                .body("""
                        window.onload = function() {
                          window.ui = SwaggerUIBundle({
                            configUrl: '/v3/api-docs/swagger-config',
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            displayOperationId: false,
                            defaultModelsExpandDepth: 1,
                            defaultModelExpandDepth: 1,
                            defaultModelRendering: 'example',
                            displayRequestDuration: false,
                            docExpansion: 'none',
                            filter: false,
                            showExtensions: false,
                            showCommonExtensions: false,
                            tryItOutEnabled: false,
                            persistAuthorization: true,
                            withCredentials: true,
                            requestInterceptor: function(request) {
                              var token = sessionStorage.getItem('swagger_access_token');
                              if (token) {
                                request.headers = request.headers || {};
                                request.headers.Authorization = 'Bearer ' + token;
                              }
                              request.credentials = 'include';
                              return request;
                            },
                            presets: [
                              SwaggerUIBundle.presets.apis,
                              SwaggerUIStandalonePreset
                            ],
                            plugins: [
                              SwaggerUIBundle.plugins.DownloadUrl
                            ],
                            layout: 'StandaloneLayout'
                          });
                        };
                        """);
    }
}
