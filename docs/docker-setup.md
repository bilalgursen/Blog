# Docker ile Tam Stack Kurulumu

Proje `docker compose up` ile PostgreSQL + Strapi + Next.js olarak tek komutta ayağa kalkar.

## Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) (Compose v2 dahil)
- Git ile proje klonu

Node.js veya pnpm kurulumu **gerekmez** — tüm uygulamalar container içinde çalışır.

## Hızlı Başlangıç

```bash
# 1. Ortam dosyalarını üret (gerçek rastgele secret'larla, idempotent)
sh scripts/setup.sh

# 2. Tüm stack'i başlat
docker compose up --build
# veya arka planda:
docker compose up --build -d
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

### İlk kurulum nasıl hızlı çalışır?

- **Store tohumlama:** `docker/Dockerfile` build sırasında lockfile'daki tüm
  paketleri imaj içindeki pnpm store'a indirir (`pnpm fetch`). Boş
  `dev_pnpm_store` volume'u ilk mount'ta imajdaki içerikle tohumlanır; ilk
  `up`'taki `pnpm install` bu yüzden çoğunlukla offline çalışır ve saniyeler
  sürer. Bu build katmanı yalnızca `pnpm-lock.yaml` değişince yeniden çalışır.
- **Install kilidi:** `cms` ve `web` aynı `node_modules` volume'unu paylaşır;
  entrypoint `flock` ile kilitler — yalnızca bir container kurulum yapar,
  diğeri bekler (loglarda "Başka bir container bağımlılıkları kuruyor" görünür).
- **Hash tabanlı bayatlık kontrolü:** kurulumdan sonra `pnpm-lock.yaml`
  hash'i `node_modules/.pnpm-lock.hash` içine yazılır. Lockfile değişince
  container bir sonraki açılışta farkı görüp otomatik yeniden kurar —
  `pnpm docker:reset` (DB'yi de silen) komutuna gerek kalmaz.

## Ortam Değişkenleri

Kök `.env` dosyası tüm servisler tarafından okunur. Docker içinde servisler birbirine **servis adıyla** erişir (`localhost` değil); compose bu host'ları override eder:

| Değişken | Docker içi değer | Neden |
| --- | --- | --- |
| `POSTGRES_HOST` (web + cms) | `db` | `.env` içindeki `localhost` yalnızca Docker dışı geliştirme içindir; cms/web Postgres'e `db:5432` üzerinden ulaşır |
| `STRAPI_INTERNAL_URL` (web) | `http://cms:1337` | Server Component fetch'i **ve** `/uploads` medya proxy'si Strapi'ye container ağından bu adresle ulaşır (medya web'in kendi origin'inden sunulur — bkz. [media-proxy.md](media-proxy.md)) |

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
| `pnpm docker:reset` | Container + **tüm** volume'ları sil (DB dahil sıfırlanır) |
| `pnpm docker:reset:deps` | Yalnızca `dev_node_modules` + `dev_pnpm_store` volume'larını sil (DB verisi korunur) |

Bağımlılık değişikliğinden sonra ekstra bir şey gerekmez: container bir sonraki
`docker compose up`'ta lockfile hash farkını görüp bağımlılıkları kendisi
yeniden kurar. Volume'ları elle sıfırlamak gerekirse `pnpm docker:reset:deps`
kullanın (DB'ye dokunmaz).

## Yerel Geliştirme (Docker Olmadan)

Docker yerine doğrudan host'ta çalıştırmak için:

```bash
pnpm bootstrap            # .env + apps/cms/.env üretir (idempotent)
pnpm install
docker compose up -d db   # sadece PostgreSQL
pnpm dev
```

## Sorun Giderme

**Port çakışması:** `.env` içinde `POSTGRES_PORT`, `WEB_PORT` veya `CMS_PORT` değiştirin.

**Eski node_modules volume:** Normalde kendiliğinden düzelir — entrypoint lockfile hash'ini kontrol edip gerekirse yeniden kurar. Düzelmezse `pnpm docker:reset:deps` (DB verisi korunur) ardından `docker compose up --build`.

**Strapi yavaş ilk açılış:** Admin paneli derlemesi ilk seferde 1–2 dakika sürebilir; normaldir.

**CMS sürekli `PostgreSQL bekleniyor (localhost:5432)` yazıyor:** `.env`'deki `POSTGRES_HOST=localhost` cms container'ına sızmış demektir. cms servisinde `POSTGRES_HOST: db` set edilmiş olmalı (`docker-compose.yml`).

**Web 500 — `Module not found: motion/react` (veya yeni eklenen bir paket):** `dev_node_modules` volume'ü eski kalmış. Container'ları yeniden başlatmak (`docker compose up`) lockfile hash kontrolüyle normalde bunu kendiliğinden çözer. Çözmezse `pnpm docker:reset:deps` (DB verisi korunur) + `rm -rf apps/web/.next` ardından `docker compose up --build`.

**Web 500 — `ECONNREFUSED 127.0.0.1:1337`:** Web, Strapi'ye `localhost` üzerinden ulaşmaya çalışıyor. `STRAPI_INTERNAL_URL=http://cms:1337` web servisinde tanımlı olmalı (`docker-compose.yml`).
