# syntax=docker/dockerfile:1

# =====================================================================
# Build stage
# =====================================================================
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Maven wrapper (mvnw uses LF line endings, safe in Linux containers).
COPY mvnw .
COPY .mvn .mvn/
RUN chmod +x mvnw

# Copy only the POM first so dependency resolution is cached as its own layer.
# Rebuilding after source changes won't re-download Maven or dependencies.
COPY pom.xml .
RUN ./mvnw -B dependency:go-offline -DskipTests

# Copy the application source and package the executable jar (skip tests).
COPY src ./src
RUN ./mvnw -B package -DskipTests

# =====================================================================
# Run stage
# =====================================================================
FROM eclipse-temurin:25-jre
WORKDIR /app

# Run as a non-root user for security.
RUN groupadd -r spring && useradd -r -g spring spring
USER spring

# Copy the fat jar built in the previous stage.
ARG JAR_FILE=target/*.jar
COPY --from=build --chown=spring:spring ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
