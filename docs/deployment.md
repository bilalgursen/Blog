# Sunucuda Yayına Alma (Deployment)

Stack: **PostgreSQL + Strapi 5 + Next.js 16 + Caddy (otomatik HTTPS)**, hepsi
`docker-compose.prod.yml` ile tek proje (`blog-prod`) olarak çalışır.
Tüm adımları `./blog` CLI'ı yönetir; bu doküman perde arkasını ve özel
durumları anlatır.

> Yerel **geliştirme** için: [`docker-setup.md`](./docker-setup.md).

---

## 1. Hızlı yol

```bash
# Sunucuda (SSH)
curl -fsSL https://raw.githubusercontent.com/bilalgursen/Blog/main/scripts/install.sh \
  | sh -s -- --domain blog.alanadiniz.com
```

ya da elle:

```bash
git clone https://github.com/bilalgursen/Blog.git blog && cd blog
./blog deploy --domain blog.alanadiniz.com
```

Kurulumdan hemen sonra `https://cms.blog.alanadiniz.com/admin` adresinde
**yönetici hesabını oluşturun** (ilk hesabı açan yönetici olur).

---

## 2. Gereksinimler

| | |
| --- | --- |
| Sunucu | Linux (Ubuntu 22.04+ önerilir), **2 vCPU / 4 GB RAM** — ya da 2 GB RAM + 2 GB swap |
| Docker | Engine 24+ ve Compose v2. Yoksa `./blog deploy` resmi betikle (get.docker.com) kurmayı teklif eder |
| DNS | `DOMAIN` ve `CMS_DOMAIN` için A (IPv6 varsa AAAA) kaydı → sunucu IP'si |
| Ağ | 80 ve 443 açık (bulut sağlayıcı güvenlik grubu + `ufw` vb.) |

**Alan adı yoksa:** `--domain <IP>.sslip.io` (ör. `203.0.113.10.sslip.io`).
sslip.io, adın içindeki IP'yi döndüren herkese açık bir DNS servisidir;
`cms.203.0.113.10.sslip.io` de otomatik çalışır ve Let's Encrypt sertifikası alınabilir.

---

## 3. Mimari

```text
İnternet ──HTTPS──> caddy (:80/:443, Let's Encrypt)
                       │
        ┌──────────────┴───────────────┐
        ▼  DOMAIN                      ▼  CMS_DOMAIN
   web  (Next.js :3000)  ──────>  cms (Strapi :1337)
        │   http://cms:1337            │
        └──────────────┬───────────────┘
                       ▼
                 db (PostgreSQL :5432, dışarı kapalı)
```

- Servisler birbirine **servis adıyla** ulaşır (`cms`, `db`).
- `web` ve `cms` portları yalnızca `127.0.0.1`'e bağlanır; dışarıya yalnızca Caddy açıktır.
- Strapi, `IS_PROXIED=true` ile Caddy'nin `X-Forwarded-*` başlıklarına güvenir:
  istekler HTTPS olarak algılanır ve admin oturum çerezleri `secure` işaretlenir.
- Next.js imajına alan adı **gömülmez**; alan adı değişse de imajı yeniden
  derlemek gerekmez (medya `/uploads` proxy'si, bkz. [media-proxy.md](media-proxy.md)).

| Dosya | Görev |
| --- | --- |
| [`blog`](../blog) | CLI: yapılandırma, derleme, sağlık bekleme, yedekleme |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | Üretim stack'i (`name: blog-prod`) |
| [`docker/Dockerfile.prod`](../docker/Dockerfile.prod) | Çok aşamalı derleme; `web` ve `cms` target'ları, root olmayan kullanıcı |
| [`docker/caddy/Caddyfile`](../docker/caddy/Caddyfile) | Reverse proxy + otomatik HTTPS |
| `.env.production` | Üretim değişkenleri (CLI üretir, git'e girmez, `chmod 600`) |

---

## 4. `.env.production`

`./blog deploy` bu dosyayı [`.env.production.example`](../.env.production.example)
şablonundan üretir. Boş/placeholder secret'lar rastgele doldurulur; **mevcut
değerlere asla dokunulmaz** (ör. DB parolası değişseydi veritabanına erişim kopardı).

| Değişken | Açıklama |
| --- | --- |
| `COMPOSE_PROFILES` | `caddy` → dahili Caddy açık. Boş → kendi reverse proxy'niz |
| `DOMAIN` / `CMS_DOMAIN` | Blog ve Strapi alan adları |
| `CMS_URL` | Strapi'nin dış adresi (`https://CMS_DOMAIN`) |
| `POSTGRES_*` | Veritabanı adı, kullanıcısı, parolası (rastgele) |
| `APP_KEYS`, `*_SALT`, `*_SECRET`, `ENCRYPTION_KEY` | Strapi anahtarları (rastgele) |
| `REVALIDATE_SECRET` | `POST /api/revalidate` için (rastgele) |
| `STRAPI_API_TOKEN` | İsteğe bağlı |
| `WEB_PORT` / `CMS_PORT` | `127.0.0.1` üzerindeki portlar (kendi proxy'niz için) |

Her servis yalnızca ihtiyaç duyduğu değişkenleri alır (compose dosyasında
açıkça listelenir): `web` Strapi anahtarlarını, `cms` revalidate secret'ını görmez.
Yeni bir değişken eklerseniz `docker-compose.prod.yml`'de ilgili servisin
`environment` bölümüne de ekleyin.

### Elle yönetmek (CLI olmadan)

```bash
cp .env.production.example .env.production
# boş değerleri doldurun: openssl rand -hex 32
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

`--env-file` unutulursa compose açık bir hatayla durur
(`.env.production eksik — önce ./blog deploy çalıştırın`).

---

## 5. Kendi reverse proxy'nizi kullanmak (`--no-caddy`)

Sunucuda zaten Nginx/Traefik/Caddy varsa:

```bash
./blog deploy --domain blog.alanadiniz.com --no-caddy
```

Web `127.0.0.1:3000`, Strapi `127.0.0.1:1337` adresinde dinler. Nginx örneği:

```nginx
server {
    server_name blog.alanadiniz.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
server {
    server_name cms.blog.alanadiniz.com;
    client_max_body_size 200M;   # medya yüklemeleri
    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
# TLS için: certbot --nginx
```

`X-Forwarded-Proto` başlığı önemlidir: Strapi admin çerezlerinin `secure`
olarak ayarlanması buna bağlıdır. Caddy'ye geri dönmek için: `./blog deploy --caddy`.

---

## 6. Güncelleme

```bash
./blog update
```

1. `git pull --ff-only` (sunucuda yerel değişiklik varsa durur ve uyarır),
2. CLI'ın yeni sürümüyle devam eder,
3. `postgres` / `caddy` taban imajlarını günceller,
4. yeniden derler, yalnızca değişen servisleri yeniden oluşturur, sağlıklarını bekler,
5. etiketsiz eski imajları temizler.

Veriler volume'lerde olduğu için güncellemeden etkilenmez.

---

## 7. Yedekleme ve geri yükleme

```bash
./blog backup                          # backups/blog-prod-YYYYMMDD-HHMMSS.tar.gz
./blog restore backups/<dosya>.tar.gz  # onay ister (-y ile sormaz)
./blog restore dump.sql                # yalnızca veritabanı (düz SQL dump)
```

Arşiv içeriği: `db.sql` (`pg_dump --no-owner --no-acl`), `uploads.tar` (medya),
`meta.txt` (tarih, ortam, commit). Geri yükleme veritabanını **sıfırdan**
oluşturur, medya klasörünü yedektekiyle değiştirir ve uygulamaları yeniden
başlatır. Geliştirme ↔ üretim arasında taşınabilir (kullanıcı/sahiplik bilgisi
içermez); yazılar, medya ve Strapi admin hesapları birlikte taşınır. Ortamlar
farklı gizli anahtarlar kullandığı için Strapi **API token'larını** taşıdıktan
sonra yeniden oluşturun.

Günlük otomatik yedek (`crontab -e`):

```cron
0 3 * * * cd ~/blog && ./blog backup --prod -y >> backups/cron.log 2>&1
```

> Yedekleri düzenli olarak sunucu dışına kopyalayın (`scp`, `rclone`, S3...).

---

## 8. Swap ekleme

Next.js + Strapi admin derlemesi ~3 GB belleğe ihtiyaç duyar. 2 GB RAM'li
sunucularda derleme `exit 137` (OOM) ile düşebilir; 2 GB swap ekleyin:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 9. Drizzle migration'ları (uygulama tabloları)

Strapi kendi tablolarını (`public` şeması) otomatik yönetir. `@repo/db`
(Drizzle, `app` şeması) tabloları henüz web tarafından kullanılmıyor; kullanmaya
başladığınızda migration'ları tek seferlik bir container ile uygulayın:

```bash
set -a; . ./.env.production; set +a
docker run --rm --network blog-prod_default \
  -e POSTGRES_HOST=db -e POSTGRES_PORT=5432 -e POSTGRES_SSL=false \
  -e POSTGRES_DB -e POSTGRES_USER -e POSTGRES_PASSWORD \
  -v "$PWD":/app -w /app node:22-slim sh -c \
  "corepack enable && pnpm install --filter @repo/db --frozen-lockfile && pnpm db:migrate"
```

---

## 10. Eski kurulumdan geçiş

Bu CLI'dan önceki sürüm üretim stack'ini dizin adına göre (genelde `blog`)
proje adıyla ve `blog_*_prod` container adlarıyla çalıştırıyordu. Yeni sürüm
sabit `blog-prod` proje adını ve **yeni volume'leri** kullanır (geliştirme
ortamıyla çakışmayı önlemek için). `./blog deploy` eski kurulumu fark edip uyarır.
Verileri taşımak için:

```bash
# 1) Eski veritabanını ve medyayı dışa aktarın
docker exec blog_postgres_prod sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl' > eski.sql
docker cp blog_cms_prod:/app/public/uploads ./eski-uploads   # eski sürüm medyayı container içinde tutuyordu

# 2) Eski stack'i durdurun (80/443'ü kullanan eski reverse proxy'yi de)
docker rm -f blog_web_prod blog_cms_prod blog_postgres_prod

# 3) Yeni stack'i kurun ve veritabanını geri yükleyin
./blog deploy --domain blog.alanadiniz.com
./blog restore eski.sql

# 4) Medyayı kopyalayın
tar -C eski-uploads -cf - . | docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm --no-deps -T --entrypoint tar cms -xf - -C /app/public/uploads
```

---

## 11. Sorun giderme

| Belirti | Neden / Çözüm |
| --- | --- |
| `./blog deploy` "DNS kaydı bulunamadı" uyarısı | A kaydı henüz yayılmamış. Caddy sertifikayı otomatik tekrar dener; `./blog logs caddy` ile izleyin. |
| HTTPS çalışmıyor | 80/443 açık mı? Başka bir web sunucusu portları tutuyor mu (`sudo ss -ltnp \| grep -E ':80\|:443'`)? |
| `cms` "sağlık kontrolü başarısız" | `./blog logs cms`. Çoğunlukla `.env.production` elle düzenlenip bir anahtar silinmiştir. |
| Derleme `exit 137` | Bellek yetersiz → [Swap ekleme](#8-swap-ekleme). |
| Strapi admin girişte döngüye giriyor | Kendi proxy'nizde `X-Forwarded-Proto` başlığı eksik (bkz. bölüm 5). |
| Web'de görseller kırık | `cms` ayakta mı (`./blog status`)? Web loglarında 502 var mı? |
| İçerik 403 | Public rol izinleri her açılışta otomatik verilir; `cms` loglarında `[bootstrap]` satırlarını kontrol edin. |
| Yeni yazı görünmüyor | Yayınlandı mı? En geç 60 sn. Hemen yansıtmak için `./blog restart web` ya da `POST /api/revalidate`. |
