# Docker ile Yerel Geliştirme

Proje tek komutla PostgreSQL + Strapi + Next.js olarak ayağa kalkar:

```bash
./blog dev          # Windows (Git Bash/WSL): sh blog dev
```

Node.js veya pnpm kurulumu **gerekmez** — tüm uygulamalar container içinde çalışır.
Kaynak kod bind-mount edilir; değişiklikler anında yansır (hot-reload).

| Servis | URL |
| --- | --- |
| Next.js (web) | http://localhost:3000 |
| Strapi admin | http://localhost:1337/admin |
| PostgreSQL | localhost:5432 |

İlk Strapi açılışında admin panelinden yönetici hesabı oluşturun.

## `./blog dev` ne yapar?

1. `.env` ve `apps/cms/.env` yoksa şablonlardan üretir; tüm Strapi secret'larını
   ve `REVALIDATE_SECRET`'ı rastgele doldurur (var olan dosyalara dokunmaz).
2. `docker compose up -d --build` ile servisleri başlatır.
3. `db`, `cms` ve `web`'in Docker sağlık kontrolleri **healthy** olana kadar
   bekler, bu sırada her servisin son log satırını gösterir. Bir servis düşerse
   son 40 log satırını basıp durur.

Ham compose da çalışır: `./blog setup && docker compose up --build`.

## Servisler

```text
docker-compose.yml   (proje adı: blog)
├── db    → postgres:16-alpine (:5432)
├── cms   → Strapi develop (:1337)   healthcheck: /_health
└── web   → Next.js dev (:3000)      healthcheck: /api/health
```

- `db` sağlıklı olmadan `cms` ve `web` başlamaz.
- `node_modules` paylaşımlı named volume'da tutulur (host'a yazılmaz).
- Container'lar `init: true` ile çalışır → `Ctrl+C`/`./blog stop` süreçleri temiz kapatır.

### İlk kurulum nasıl hızlı çalışır?

- **Store tohumlama:** `docker/Dockerfile` build sırasında lockfile'daki tüm
  paketleri imaj içindeki pnpm store'a indirir (`pnpm fetch`). Boş
  `dev_pnpm_store` volume'u ilk mount'ta imajdaki içerikle tohumlanır; ilk
  `pnpm install` bu yüzden çoğunlukla offline çalışır.
- **Install kilidi:** `cms` ve `web` aynı `node_modules` volume'unu paylaşır;
  entrypoint `flock` ile kilitler — yalnızca bir container kurulum yapar.
- **Hash tabanlı bayatlık kontrolü:** `pnpm-lock.yaml` + `pnpm-workspace.yaml`
  hash'i `node_modules/.pnpm-lock.hash` içinde saklanır. Değişince container bir
  sonraki açılışta bağımlılıkları kendisi yeniden kurar.
- **Sistem paketi yok:** İmajda `apt-get` adımı yoktur. Native bağımlılıklar
  (sharp, esbuild, swc) hazır binary ile gelir; DB beklemesi Node ile yapılır.

## Ortam Değişkenleri

Kök `.env` dosyası tüm servisler tarafından okunur. Docker içinde servisler
birbirine **servis adıyla** erişir (`localhost` değil); compose bu host'ları override eder:

| Değişken | Docker içi değer | Neden |
| --- | --- | --- |
| `POSTGRES_HOST` (web + cms) | `db` | `.env` içindeki `localhost` yalnızca Docker dışı geliştirme içindir |
| `STRAPI_INTERNAL_URL` (web) | `http://cms:1337` | Server Component fetch'i **ve** `/uploads` medya proxy'si (bkz. [media-proxy.md](media-proxy.md)) |

Varsayılan veritabanı kimlik bilgileri: `blog` / `blog` / `blog_secret` (`POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD`).

## Yararlı Komutlar

| Komut | Açıklama |
| --- | --- |
| `./blog dev` | Kur + başlat + hazır olana kadar bekle |
| `./blog logs [servis]` | Canlı loglar |
| `./blog status` | Servis durumları |
| `./blog stop` | Container'ları durdur (veriler korunur) |
| `./blog backup --dev` | Yerel veritabanı + medya yedeği (sunucuya taşımak için) |
| `./blog reset` | Container + **tüm** volume'ları sil (DB dahil) |
| `pnpm docker:reset:deps` | Yalnızca bağımlılık volume'larını sil (DB korunur) |

## Yerel Geliştirme (Docker Olmadan)

```bash
./blog setup              # .env + apps/cms/.env üretir (idempotent)
pnpm install
docker compose up -d db   # sadece PostgreSQL
pnpm dev
```

## Sorun Giderme

**Port çakışması:** `.env` içinde `POSTGRES_PORT`, `WEB_PORT` veya `CMS_PORT` değiştirin.

**Eski node_modules volume:** Normalde kendiliğinden düzelir (hash kontrolü). Düzelmezse
`pnpm docker:reset:deps` (DB verisi korunur) ardından `./blog dev`.

**Strapi yavaş ilk açılış:** Admin paneli derlemesi ilk seferde birkaç dakika sürebilir; normaldir.

**Windows'ta `bad interpreter` / `\r` hataları:** Depo `.gitattributes` ile betikleri LF olarak
klonlar. Daha önce CRLF ile klonladıysanız: `git rm --cached -r . && git reset --hard`.

**CMS sürekli `PostgreSQL bekleniyor (localhost:5432)` yazıyor:** `.env`'deki
`POSTGRES_HOST=localhost` cms container'ına sızmış demektir; cms servisinde
`POSTGRES_HOST: db` set edilmiş olmalı (`docker-compose.yml`).

**Web 500 — `Module not found` (yeni eklenen bir paket):** `dev_node_modules` volume'ü
eski kalmış. `./blog dev` normalde bunu çözer; çözmezse `pnpm docker:reset:deps` +
`rm -rf apps/web/.next` ardından `./blog dev`.

**Web 500 — `ECONNREFUSED 127.0.0.1:1337`:** `STRAPI_INTERNAL_URL=http://cms:1337`
web servisinde tanımlı olmalı (`docker-compose.yml`).
