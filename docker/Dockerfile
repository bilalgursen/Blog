# syntax=docker/dockerfile:1

# Dev image — bağımlılıklar container ilk açılışında entrypoint'te kurulur,
# ama lockfile'daki tüm paketler build sırasında imaj içindeki pnpm store'a
# indirilir. Boş bir named volume ilk mount'ta imajdaki içerikle tohumlandığı
# için ilk `up`'taki pnpm install ağa neredeyse hiç çıkmaz.

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

# Store'u imajda ısıt: bu katman yalnızca pnpm-lock.yaml değişince yeniden çalışır.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
