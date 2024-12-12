# Use a valid Gradle image with JDK 21
FROM gradle:8.5.0-jdk21 AS builder
WORKDIR /app

# Copy Gradle project files
COPY . .

# Build the Spring Boot application
RUN gradle clean build --no-daemon

# Use a lightweight OpenJDK image for runtime
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose the port
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]