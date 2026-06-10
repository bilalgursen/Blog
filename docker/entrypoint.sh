#!/bin/sh
set -e

wait_for_db() {
  host="${POSTGRES_HOST:-${DATABASE_HOST:-db}}"
  port="${POSTGRES_PORT:-${DATABASE_PORT:-5432}}"

  echo ">> PostgreSQL bekleniyor (${host}:${port})..."
  until nc -z "$host" "$port" 2>/dev/null; do
    sleep 1
  done
  echo ">> PostgreSQL hazır."
}

case "$1" in
  pnpm)
    wait_for_db
    if [ ! -d "node_modules/.pnpm" ]; then
      echo ">> İlk kurulum: bağımlılıklar indiriliyor (~1-2 dk, yalnızca bir kez)..."
      pnpm install --frozen-lockfile
      echo ">> Bağımlılıklar hazır."
    fi
    ;;
esac

exec "$@"
