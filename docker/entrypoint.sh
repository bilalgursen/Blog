#!/bin/sh
set -e

# PostgreSQL TCP portu açılana kadar bekler. compose zaten `db` sağlıklı
# olmadan cms/web'i başlatmaz; bu yalnızca ek bir güvenlik ağıdır.
# (netcat yerine Node kullanılır → imajda ekstra paket gerekmez.)
wait_for_db() {
  DB_WAIT_HOST="${POSTGRES_HOST:-${DATABASE_HOST:-db}}"
  DB_WAIT_PORT="${POSTGRES_PORT:-${DATABASE_PORT:-5432}}"
  export DB_WAIT_HOST DB_WAIT_PORT

  echo ">> PostgreSQL bekleniyor (${DB_WAIT_HOST}:${DB_WAIT_PORT})..."
  until node -e '
    const s = require("net").connect(+process.env.DB_WAIT_PORT, process.env.DB_WAIT_HOST)
    s.on("connect", () => process.exit(0)).on("error", () => process.exit(1))
  ' 2>/dev/null; do
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
  current="$(cat pnpm-lock.yaml pnpm-workspace.yaml | sha256sum | cut -d' ' -f1)"
  stored="$(cat "$hash_file" 2>/dev/null || true)"
  if [ ! -d node_modules/.pnpm ] || [ "$current" != "$stored" ]; then
    echo ">> Bağımlılıklar kuruluyor (store imajdan tohumlu, çoğunlukla offline)..."
    # confirmModulesPurge=false: node_modules düzeni değiştiğinde (ör. yeni
    # pnpm ayarı) TTY olmayan container'da onay beklemeden yeniden kurar.
    pnpm install --frozen-lockfile --prefer-offline --config.confirmModulesPurge=false
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
