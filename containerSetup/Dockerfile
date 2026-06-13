FROM ubuntu:22.04

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install both runtimes in one layer
RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-17-jdk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root sandbox user
RUN useradd -m -u 1000 -s /bin/bash sandbox

WORKDIR /sandbox
RUN chown sandbox:sandbox /sandbox

USER sandbox

# The entrypoint script will decide which runtime to use
COPY --chown=sandbox:sandbox entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]