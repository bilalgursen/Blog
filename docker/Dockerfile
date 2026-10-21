# syntax=docker/dockerfile:1

# Geliştirme imajı (docker-compose.yml) — kaynak kod bind-mount edilir,
# hot-reload çalışır. Bağımlılıklar container ilk açılışında entrypoint'te
# kurulur; ama lockfile'daki tüm paketler build sırasında imaj içindeki pnpm
# store'una indirilir. Boş bir named volume ilk mount'ta imajdaki içerikle
# tohumlandığı için ilk `up`'taki pnpm install ağa neredeyse hiç çıkmaz.
#
# apt-get kullanılmaz: native bağımlılıkların hepsi hazır binary ile gelir,
# DB beklemesi de Node ile yapılır (bkz. entrypoint.sh).

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS dev

ARG PNPM_VERSION=10.8.1
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate \
 && pnpm config set store-dir /pnpm/store

WORKDIR /app

# Store'u imajda ısıt: bu katman yalnızca pnpm-lock.yaml değişince yeniden çalışır.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
