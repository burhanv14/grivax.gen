# syntax=docker/dockerfile:1

# =====================================================================
# Build stage
# =====================================================================
# Use the official Maven image (Maven + Temurin JDK 25 pre-installed) so
# the build never downloads the Maven distribution at build time. This
# avoids HTTP 429 rate-limit errors from repo.maven.apache.org on shared
# CI/build IPs (e.g. Render).
FROM maven:3.9.15-eclipse-temurin-25 AS build
WORKDIR /app

# Cache dependency resolution as its own layer.
# Rebuilding after source changes won't re-download dependencies.
COPY pom.xml .
RUN mvn -B dependency:go-offline -DskipTests

# Copy the application source and package the executable jar (skip tests).
COPY src ./src
RUN mvn -B package -DskipTests

# =====================================================================
# Run stage
# =====================================================================
FROM eclipse-temurin:25-jre
WORKDIR /app

# Run as a non-root user for security.
RUN groupadd -r spring && useradd -r -g spring spring
USER spring

# Copy the fat jar built in the previous stage.
# Use an absolute path: COPY --from=build resolves the source root-relative,
# not relative to the build stage's WORKDIR.
ARG JAR_FILE=/app/target/*.jar
COPY --from=build --chown=spring:spring ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
