FROM mcr.microsoft.com/devcontainers/typescript-node:24

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        docker.io \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN npx playwright install --with-deps chromium