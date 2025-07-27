# =================================================================
# Stage 1: Build the application using Gradle
# =================================================================
# Use a Gradle image with JDK 21 to match your build.gradle.kts
FROM gradle:8.5.0-jdk21-jammy AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Gradle wrapper files first to leverage Docker layer caching
COPY gradlew gradlew.bat ./
COPY gradle ./gradle

# Make the gradlew script executable (important for Linux-based images)
RUN chmod +x ./gradlew

# Copy the build configuration files. Note the .kts extension for Kotlin script.
COPY build.gradle.kts settings.gradle.kts ./

# Download dependencies. This is a separate step to leverage Docker caching.
# If build files don't change, this layer will be cached.
# Using ./gradlew ensures we use the project's specified version.
RUN ./gradlew dependencies --no-daemon

# Copy the rest of the source code
COPY src ./src

# Build the application. The --no-daemon flag is recommended for CI/CD.
# The '-x test' flag skips running tests during the Docker build.
RUN ./gradlew build --no-daemon -x test

# =================================================================
# Stage 2: Create the final, lightweight runtime image
# =================================================================
# Use a minimal JRE image for a smaller footprint and attack surface
FROM eclipse-temurin:21-jre-jammy

# Create a dedicated user and group for security purposes
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring

# Set the working directory
WORKDIR /app

# Argument to specify the JAR file path from the builder stage
ARG JAR_FILE=/app/build/libs/*.jar

# Copy the built JAR from the 'builder' stage to the final image
COPY --from=builder ${JAR_FILE} application.jar

# Expose the port your application runs on (8080 is the default for Spring Boot)
EXPOSE 8080

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "application.jar"]