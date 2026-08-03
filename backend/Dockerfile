# Multi-stage build: compile with Maven + JDK 17, then run on a slim JRE-only
# image so the deployed container doesn't carry the whole build toolchain.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Downloads dependencies as its own layer so a source-only change doesn't
# force re-downloading the whole dependency tree on the next build.
RUN mvn dependency:go-offline -B
COPY src src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
# Matches pom.xml's <finalName>app</finalName>.
COPY --from=build /app/target/app.jar app.jar
# Render (and most Docker-based PaaS hosts) assign the real listen port via
# $PORT at runtime - server.port in application.yaml already reads that.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
