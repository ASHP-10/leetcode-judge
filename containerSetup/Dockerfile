FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-17-jdk \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m sandbox

WORKDIR /sandbox

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

USER sandbox

ENTRYPOINT ["/entrypoint.sh"]