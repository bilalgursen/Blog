#!/bin/sh
# Geriye dönük uyumluluk: `pnpm bootstrap` / `sh scripts/setup.sh`.
# .env dosyalarını rastgele secret'larla üretir (idempotent).
# Asıl mantık kökteki `blog` CLI'ındadır: ./blog setup
set -e
exec sh "$(dirname "$0")/../blog" setup "$@"
