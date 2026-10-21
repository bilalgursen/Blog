#!/bin/sh
# ==============================================================
#  Sunucuya tek satırla kurulum (Ubuntu/Debian/Fedora/Alpine...)
#
#    curl -fsSL https://raw.githubusercontent.com/bilalgursen/Blog/main/scripts/install.sh \
#      | sh -s -- --domain blog.ornek.com
#
#  Yaptıkları:
#    1. git yoksa kurar
#    2. depoyu klonlar (varsa günceller) → varsayılan: ~/blog
#    3. `./blog deploy` çalıştırır (Docker yoksa kurmayı teklif eder,
#       secret'ları üretir, HTTPS ile yayına alır)
#
#  Kurulum seçenekleri (geri kalan her şey ./blog deploy'a iletilir):
#    --repo <git-url>   Kendi fork'unuz (varsayılan: bilalgursen/Blog)
#    --branch <dal>     Varsayılan: main
#    --dir <klasör>     Varsayılan: ~/blog
# ==============================================================
set -eu

REPO=${BLOG_REPO:-https://github.com/bilalgursen/Blog.git}
BRANCH=${BLOG_BRANCH:-main}
DIR=${BLOG_DIR:-$HOME/blog}

remaining=$#
while [ "$remaining" -gt 0 ]; do
  arg=$1
  shift
  remaining=$((remaining - 1))
  case "$arg" in
    --repo | --branch | --dir)
      [ "$remaining" -gt 0 ] || { echo "$arg bir değer bekliyor" >&2; exit 1; }
      case "$arg" in
        --repo) REPO=$1 ;;
        --branch) BRANCH=$1 ;;
        --dir) DIR=$1 ;;
      esac
      shift
      remaining=$((remaining - 1))
      ;;
    *) set -- "$@" "$arg" ;;
  esac
done

say() { printf '\033[36m==>\033[0m %s\n' "$*"; }

SUDO=''
if [ "$(id -u)" -ne 0 ]; then
  command -v sudo >/dev/null 2>&1 && SUDO=sudo
fi

if ! command -v git >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1; then
  say "git ve curl kuruluyor"
  if command -v apt-get >/dev/null 2>&1; then
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq git ca-certificates curl
  elif command -v dnf >/dev/null 2>&1; then
    $SUDO dnf install -y -q git curl
  elif command -v yum >/dev/null 2>&1; then
    $SUDO yum install -y -q git curl
  elif command -v apk >/dev/null 2>&1; then
    $SUDO apk add --no-cache git curl
  else
    echo "git bulunamadı; lütfen elle kurun ve tekrar deneyin." >&2
    exit 1
  fi
fi

if [ -d "$DIR/.git" ]; then
  say "Mevcut kurulum güncelleniyor: $DIR"
  git -C "$DIR" pull --ff-only
else
  say "Depo klonlanıyor: $REPO ($BRANCH) → $DIR"
  git clone --branch "$BRANCH" "$REPO" "$DIR"
fi

cd "$DIR"
exec sh ./blog deploy "$@"
