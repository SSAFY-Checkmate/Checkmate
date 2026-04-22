package com.ssafy.a405;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class A405Application {

	public static void main(String[] args) {
		SpringApplication.run(A405Application.class, args);
	}

}
