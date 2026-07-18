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

# cms ve web aynı node_modules volume'unu paylaşır; flock ile yalnızca biri
# kurulum yapar, diğeri bekler. Süreç ölürse kernel kilidi bırakır (stale-lock
# riski yok). Lockfile hash'i saklanır: pnpm-lock.yaml değişince volume
# silmeden (docker:reset gerektirmeden) otomatik yeniden kurulur.
install_deps() {
  hash_file="node_modules/.pnpm-lock.hash"
  mkdir -p node_modules
  exec 9> node_modules/.install.lock
  if ! flock -n 9; then
    echo ">> Başka bir container bağımlılıkları kuruyor, bekleniyor..."
    flock 9
  fi
  current="$(sha256sum pnpm-lock.yaml | cut -d' ' -f1)"
  stored="$(cat "$hash_file" 2>/dev/null || true)"
  if [ ! -d node_modules/.pnpm ] || [ "$current" != "$stored" ]; then
    echo ">> Bağımlılıklar kuruluyor (store imajdan tohumlu, çoğunlukla offline)..."
    pnpm install --frozen-lockfile --prefer-offline
    printf '%s' "$current" >"$hash_file"
    echo ">> Bağımlılıklar hazır."
  fi
  flock -u 9
}

case "$1" in
  pnpm)
    install_deps
    wait_for_db
    ;;
esac

exec "$@"
