FROM gradle:8-jdk17 AS builder
WORKDIR /app

ARG SPRING_PROFILES_ACTIVE=prod
ARG PROD_DB_URL
ARG PROD_DB_USERNAME
ARG PROD_DB_PASSWORD

ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
ENV PROD_DB_URL=${PROD_DB_URL}
ENV PROD_DB_USERNAME=${PROD_DB_USERNAME}
ENV PROD_DB_PASSWORD=${PROD_DB_PASSWORD}

COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src

RUN chmod +x ./gradlew
RUN ./gradlew clean test build --no-daemon

RUN JAR_FILE=$(find build/libs -name "*.jar" ! -name "*plain.jar" | head -n 1) && \
    cp "$JAR_FILE" build/libs/app.jar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=builder /app/build/libs/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]