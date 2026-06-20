# Sunucuda Yayına Alma (Deployment)

Bu doküman projeyi **yerelde** ve **sunucuda (production)** Docker ile nasıl
ayağa kaldıracağını adım adım anlatır. Stack: **PostgreSQL + Strapi 5 (CMS) +
Next.js 16 (web)**, hepsi tek `docker compose` ile çalışır.

> Yerel **geliştirme** (hot-reload) için ayrı doküman: [`docker-setup.md`](./docker-setup.md).
> Bu doküman **yayın/üretim** kurulumuna odaklanır.

---

## 1. Mimari Özet

```text
İnternet ──HTTPS──> Reverse Proxy (Nginx/Caddy/Traefik)
                       │
        ┌──────────────┴───────────────┐
        ▼                              ▼
   web  (Next.js :3000)          cms (Strapi :1337/admin, :1337/api)
        │  server-side fetch          │
        │  http://cms:1337            │
        └──────────────┬──────────────┘
                       ▼
                 db (PostgreSQL :5432)
```

- **web** ve **cms** container'ları birbirine **servis adıyla** ulaşır
  (`cms`, `db`) — `localhost` değil.
- Portlar yalnızca `127.0.0.1`'e bağlanır; dışarıya açmayı **reverse proxy** yapar
  ve TLS'i (HTTPS) orada sonlandırır.

---

## 2. Gereksinimler

### Sunucu
- Linux sunucu (Ubuntu 22.04+ önerilir), **2 vCPU / en az 4 GB RAM** (Strapi
  derlemesi RAM ister; 2 GB'de OOM olabilir).
- **Docker Engine 24+** ve **Docker Compose v2** (`docker compose`, tireli değil).
- Açık portlar: yalnızca **80/443** (reverse proxy). 3000/1337 dışarı açılmaz.
- Bir alan adı (örn. `blog.alanadiniz.com` ve `cms.alanadiniz.com`) ve DNS A kaydı.

### Yerelde test için
- Docker Desktop **veya** Colima (macOS) + Docker CLI.
- Node.js/pnpm **gerekmez** — her şey container içinde derlenir.

Docker kurulu mu kontrol:
```bash
docker --version          # Docker version 24+ olmalı
docker compose version    # v2 olmalı
```

---

## 3. Ortam Değişkenleri (`.env`)

Tüm servisler kök `.env` dosyasını okur. Şablonu kopyalayıp **üretim
değerleriyle** doldurun:

```bash
cp .env.example .env
```

Üretimde **mutlaka değiştirilmesi gerekenler**:

| Değişken | Açıklama | Üretim örneği |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | Güçlü, rastgele parola | `openssl rand -base64 24` çıktısı |
| `POSTGRES_USER` / `POSTGRES_DB` | DB kullanıcı/db adı | `blog` |
| `NEXT_PUBLIC_STRAPI_URL` | **Tarayıcıya açık** Strapi adresi. ⚠️ **Derleme anında** web imajına gömülür. | `https://cms.alanadiniz.com` |
| `APP_KEYS` | Strapi oturum anahtarları (virgülle 2+) | `openssl rand -base64 16` × birkaç |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Strapi gizli anahtarları | her biri `openssl rand -base64 16` |
| `ENCRYPTION_KEY` | Strapi şifreleme (32+ karakter) | `openssl rand -base64 24` |

Gizli anahtarları hızlıca üret:
```bash
for k in APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY; do
  echo "$k=$(openssl rand -base64 24)"
done
```

> ⚠️ **Çok önemli — `NEXT_PUBLIC_STRAPI_URL` derleme anında gömülür.**
> Next.js `NEXT_PUBLIC_*` değişkenlerini client bundle'a **build sırasında**
> yazar. Bu yüzden compose, bu değeri web imajına **build arg** olarak geçer.
> Alan adını değiştirirseniz web imajını **yeniden build** etmelisiniz
> (`--build`). Server-side fetch ise runtime'da `http://cms:1337` kullanır
> (`STRAPI_INTERNAL_URL`), bu değişmez.

Docker içinde host'lar otomatik ayarlanır (compose override eder), elle
girmenize gerek yok:

| Değişken | Docker içi değer |
| --- | --- |
| `POSTGRES_HOST` (web+cms) | `db` |
| `STRAPI_INTERNAL_URL` (web) | `http://cms:1337` |

---

## 4. Üretim Dosyaları

Bu repo üretim için hazır gelir:

| Dosya | Görev |
| --- | --- |
| [`docker/Dockerfile.prod`](../docker/Dockerfile.prod) | Multi-stage build; `web` (Next standalone) ve `cms` (Strapi) target'ları |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | Üretim stack'i (db + cms + web), portlar 127.0.0.1'e bağlı |
| `apps/web/next.config.ts` | `output: "standalone"` — ince çalıştırma imajı |

---

## 5. Sunucuda Yayına Alma — Adımlar

```bash
# 1) Sunucuya kodu çek
git clone <repo-url> blog && cd blog
git checkout main          # veya yayın dalınız

# 2) Ortam dosyasını üretim değerleriyle doldur
cp .env.example .env
nano .env                  # parola + secret + NEXT_PUBLIC_STRAPI_URL ayarla

# 3) Tüm stack'i build edip arka planda başlat
docker compose -f docker-compose.prod.yml up -d --build
#   kısayol: pnpm docker:prod:up

# 4) Durumu izle
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f   # pnpm docker:prod:logs
```

İlk `up` build içerir; sunucu gücüne göre 3–8 dakika sürebilir.

Hazır olduğunda (container içinden doğrulama):
```bash
curl -I http://127.0.0.1:3000           # web  -> HTTP 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:1337/_health   # cms -> 204
```

### İlk Strapi kurulumu
`https://cms.alanadiniz.com/admin` adresine gidip **ilk yönetici hesabını**
oluşturun. Ardından **Settings → API Tokens** altında bir "Read-only" token
üretip, web'in onu kullanması gerekiyorsa `.env` içindeki `STRAPI_API_TOKEN`'a
yazın ve web'i yeniden başlatın.

Strapi içerik tiplerinin (Article vb.) **public read** izinleri:
**Settings → Users & Permissions → Roles → Public** altından `find`/`findOne`
izinlerini açın; aksi halde web'de içerik 403 döner.

---

## 6. Reverse Proxy + HTTPS

Container'lar yalnızca `127.0.0.1`'e açıktır. Önüne bir proxy koyup TLS'i orada
sonlandırın. **Caddy** ile en kısa örnek (otomatik Let's Encrypt):

```caddyfile
# /etc/caddy/Caddyfile
blog.alanadiniz.com {
    reverse_proxy 127.0.0.1:3000
}

cms.alanadiniz.com {
    reverse_proxy 127.0.0.1:1337
}
```

**Nginx** karşılığı (özet):
```nginx
server {
    server_name blog.alanadiniz.com;
    location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
    # certbot ile TLS ekleyin
}
server {
    server_name cms.alanadiniz.com;
    location / { proxy_pass http://127.0.0.1:1337; proxy_set_header Host $host; }
    client_max_body_size 50M;   # medya yüklemeleri için
}
```

> `NEXT_PUBLIC_STRAPI_URL=https://cms.alanadiniz.com` olmalı (proxy adresi),
> `http://...:1337` değil.

---

## 7. Veritabanı Migration'ları (Drizzle)

Strapi kendi tablolarını otomatik yönetir. **Uygulama tabloları** (`@repo/db`,
`app` şeması) için migration'ları üretimde ayrıca uygulamak gerekir.

> ⚠️ Standalone **web imajı** yalnızca çalıştırma dosyalarını içerir;
> `drizzle-kit` ve `packages/db` kaynağı **yoktur**. Bu yüzden migration'ı web
> container'ından çalıştıramazsınız. Aşağıdaki tek seferlik (one-off) container
> yöntemini veya CI adımını kullanın.

```bash
# DB container'ı ile aynı ağda, kaynak monteli tek seferlik bir job:
docker run --rm \
  --network blog_default \
  -e POSTGRES_HOST=db -e POSTGRES_PORT=5432 -e POSTGRES_SSL=false \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -v "$PWD":/app -w /app \
  node:22-slim sh -lc \
  "corepack enable && pnpm install --filter @repo/db --frozen-lockfile && pnpm db:migrate"
```
> `blog_default` ağ adını `docker network ls` ile doğrulayın (compose proje
> adına göre değişebilir). Alternatif: DB portunu geçici dışarı verip host'ta
> `pnpm db:migrate` çalıştırın.

---

## 8. Güncelleme (Yeni Sürüm Yayınlama)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
# eski imajları temizle
docker image prune -f
```
`up -d --build` yalnızca değişen servisleri yeniden oluşturur; `db` verisi
`postgres_data` volume'ünde korunur.

---

## 9. Yedekleme

Kalıcı veri iki volume'de tutulur: `postgres_data` (DB) ve `cms_uploads` (medya).

```bash
# PostgreSQL dump
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F).sql

# Medya yüklemeleri
docker run --rm -v blog_cms_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads_$(date +%F).tar.gz -C /data .
```

---

## 10. Yararlı Komutlar (Üretim)

| Komut | Açıklama |
| --- | --- |
| `pnpm docker:prod:up` | Build + arka planda başlat |
| `pnpm docker:prod:down` | Durdur (volume'ler korunur) |
| `pnpm docker:prod:logs` | Tüm servis logları |
| `docker compose -f docker-compose.prod.yml ps` | Durum |
| `docker compose -f docker-compose.prod.yml restart web` | Tek servisi yeniden başlat |

---

## 11. Sorun Giderme

| Belirti | Neden / Çözüm |
| --- | --- |
| Web'de medya görselleri kırık | `NEXT_PUBLIC_STRAPI_URL` yanlış adresle **build** edilmiş. Doğru alan adıyla `--build` ile yeniden oluştur. |
| Web 500 — `ECONNREFUSED 127.0.0.1:1337` | `STRAPI_INTERNAL_URL=http://cms:1337` eksik. Compose web servisinde tanımlı olmalı. |
| Strapi içerik 403 | Public rolünde `find`/`findOne` izinleri kapalı. Strapi admin'den aç. |
| `cms` build OOM (exit 137) | Sunucu RAM'i yetersiz. 4 GB'a çıkarın ya da swap ekleyin. |
| Strapi ilk açılış yavaş | Admin paneli derlemesi ilk seferde uzun sürer; normaldir. |
| CMS sürekli DB bekliyor | `db` sağlıklı mı? `docker compose -f docker-compose.prod.yml logs db`. |
