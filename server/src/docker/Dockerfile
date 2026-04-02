FROM openjdk:11

WORKDIR /app

COPY src/execute/Solution.java /app/

RUN javac Solution.java

CMD ["java", "-cp", "/app", "Solution"]
