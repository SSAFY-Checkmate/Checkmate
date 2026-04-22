FROM gradle:8-jdk17 AS builder
WORKDIR /app

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

COPY --from=builder /app/build/libs/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]