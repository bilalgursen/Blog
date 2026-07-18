#!/bin/sh
# Tek komutluk ilk kurulum: .env dosyalarını şablonlardan üretir ve
# "changeMe" placeholder'ları yerine gerçek rastgele secret'lar yazar.
# İdempotenttir: var olan .env dosyalarına dokunmaz.
# Kullanım: pnpm bootstrap  (veya: sh scripts/setup.sh)
set -e
cd "$(dirname "$0")/.."

if ! command -v openssl >/dev/null 2>&1; then
  echo "HATA: openssl bulunamadı (secret üretimi için gerekli)." >&2
  exit 1
fi

# hex çıktı: sed replacement içinde kaçış gerektiren karakter içermez.
APP_KEYS="$(openssl rand -hex 16),$(openssl rand -hex 16)"
API_TOKEN_SALT="$(openssl rand -hex 16)"
ADMIN_JWT_SECRET="$(openssl rand -hex 32)"
TRANSFER_TOKEN_SALT="$(openssl rand -hex 16)"
JWT_SECRET="$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 16)" # tam 32 karakter
REVALIDATE_SECRET="$(openssl rand -hex 24)"

render_env() {
  # $1: şablon, $2: hedef — şablondaki placeholder satırlarını secret'larla değiştirir.
  sed \
    -e "s|^APP_KEYS=.*|APP_KEYS=${APP_KEYS}|" \
    -e "s|^API_TOKEN_SALT=.*|API_TOKEN_SALT=${API_TOKEN_SALT}|" \
    -e "s|^ADMIN_JWT_SECRET=.*|ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}|" \
    -e "s|^TRANSFER_TOKEN_SALT=.*|TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}|" \
    -e "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" \
    -e "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=${ENCRYPTION_KEY}|" \
    -e "s|^REVALIDATE_SECRET=.*|REVALIDATE_SECRET=${REVALIDATE_SECRET}|" \
    "$1" >"$2"
  echo ">> $2 oluşturuldu (secret'lar üretildi)."
}

if [ -f .env ]; then
  echo ">> .env zaten var, dokunulmadı."
else
  render_env .env.example .env
fi

# Native `pnpm dev:cms` kök .env yerine bunu okur; aynı secret'ları kullanır.
if [ -f apps/cms/.env ]; then
  echo ">> apps/cms/.env zaten var, dokunulmadı."
else
  render_env apps/cms/.env.example apps/cms/.env
fi

echo ""
echo "Kurulum hazır. Sonraki adım:"
echo "  Docker ile (önerilen):  pnpm docker:up"
echo "  Native geliştirme:      pnpm install && docker compose up -d db && pnpm dev"
