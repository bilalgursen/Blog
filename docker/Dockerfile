# syntax=docker/dockerfile:1

# Hafif dev image — bağımlılıklar container ilk açılışında entrypoint'te kurulur.
# Böylece docker build ~1 dk, pnpm install ise yalnızca ilk `up`'ta bir kez çalışır.

FROM node:22-slim AS dev

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    netcat-openbsd \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/store

WORKDIR /app

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
