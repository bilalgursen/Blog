# Docker ile Tam Stack Kurulumu

Proje `docker compose up` ile PostgreSQL + Strapi + Next.js olarak tek komutta ayağa kalkar.

## Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) (Compose v2 dahil)
- Git ile proje klonu

Node.js veya pnpm kurulumu **gerekmez** — tüm uygulamalar container içinde çalışır.

## Hızlı Başlangıç

```bash
# 1. Ortam dosyasını oluştur
cp .env.example .env

# 2. Tüm stack'i başlat
docker compose up --build
# veya arka planda:
pnpm docker:up:detach
```

| Servis | URL |
| --- | --- |
| Next.js (web) | http://localhost:3000 |
| Strapi admin | http://localhost:1337/admin |
| PostgreSQL | localhost:5432 |

İlk Strapi açılışında admin panelinden yönetici hesabı oluşturun.

## Servisler

```text
docker-compose.yml
├── db    → postgres:16-alpine (:5432)
├── cms   → Strapi develop (:1337)
└── web   → Next.js dev (:3000)
```

- `db` sağlıklı olmadan `cms` ve `web` başlamaz.
- Kaynak kodu volume ile mount edilir; hot-reload çalışır.
- `node_modules` paylaşımlı named volume'da tutulur (host'a yazılmaz).

## Ortam Değişkenleri

Kök `.env` dosyası tüm servisler tarafından okunur. Docker içinde veritabanı host'u otomatik `db` olarak ayarlanır; `.env` içindeki `POSTGRES_HOST=localhost` yalnızca yerel (Docker dışı) geliştirme içindir.

Varsayılan veritabanı kimlik bilgileri:

| Değişken | Varsayılan |
| --- | --- |
| `POSTGRES_DB` | `blog` |
| `POSTGRES_USER` | `blog` |
| `POSTGRES_PASSWORD` | `blog_secret` |

## Yararlı Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm docker:up` | Build + başlat (ön planda) |
| `pnpm docker:up:detach` | Build + arka planda başlat |
| `pnpm docker:down` | Container'ları durdur |
| `pnpm docker:logs` | Tüm servis logları |
| `pnpm docker:reset` | Container + volume'ları sil (DB sıfırlanır) |

Bağımlılık değişikliğinden sonra:

```bash
docker compose build --no-cache
docker compose up
```

## Yerel Geliştirme (Docker Olmadan)

Docker yerine doğrudan host'ta çalıştırmak için:

```bash
cp .env.example .env
cp apps/cms/.env.example apps/cms/.env
pnpm install
docker compose up -d db   # sadece PostgreSQL
pnpm dev
```

## Sorun Giderme

**Port çakışması:** `.env` içinde `POSTGRES_PORT`, `WEB_PORT` veya `CMS_PORT` değiştirin.

**Eski node_modules volume:** `pnpm docker:reset` ardından yeniden `docker compose up --build`.

**Strapi yavaş ilk açılış:** Admin paneli derlemesi ilk seferde 1–2 dakika sürebilir; normaldir.
