# Blog — Next.js + Strapi Kişisel Blog & Portfolyo

Kendi blog ve portfolyo sitenizi **tek komutla** kurun, **tek komutla** yayına alın.
İçeriği Strapi admin panelinden yönetirsiniz; site Next.js ile hızlı ve SEO dostu sunulur.

[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-blue.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Strapi 5](https://img.shields.io/badge/Strapi-5-4945ff)
![Docker](https://img.shields.io/badge/Docker-tek%20komut-2496ed)

```bash
git clone https://github.com/bilalgursen/Blog.git && cd Blog
./blog dev                                   # bilgisayarınızda çalıştırın
./blog deploy --domain blog.alanadiniz.com   # sunucunuzda HTTPS ile yayına alın
```

> 🇬🇧 **English:** A self-hostable personal blog & portfolio (Next.js 16 + Strapi 5 +
> PostgreSQL). Run it locally with `./blog dev`, deploy it to any Linux server with
> automatic HTTPS via `./blog deploy --domain your.domain`. Only Docker is required.
> See [Quick start (English)](#-quick-start-english) below.

---

## İçindekiler

- [Özellikler](#-özellikler)
- [Bilgisayarınızda çalıştırın](#-bilgisayarınızda-çalıştırın)
- [Siteye ilk içeriği ekleyin](#-siteye-ilk-içeriği-ekleyin)
- [Sunucuya yayınlayın](#-sunucuya-yayınlayın)
- [Güncelleme, yedekleme ve taşıma](#-güncelleme-yedekleme-ve-taşıma)
- [Komut referansı](#-komut-referansı)
- [Mimari](#-mimari)
- [Özelleştirme](#-özelleştirme)
- [Sorun giderme](#-sorun-giderme)
- [Katkıda bulunun](#-katkıda-bulunun)

---

## ✨ Özellikler

- **Portfolyo + blog tek sayfada** — tanıtım (hero) ve yazılar Strapi'den gelir; kod yazmadan düzenlenir.
- **Strapi 5 admin paneli** — zengin metin editörü, kapak görselleri, taslak/yayın akışı, "öne çıkan" yazı.
- **Sıfır yapılandırma** — tüm parolalar ve gizli anahtarlar ilk kurulumda rastgele üretilir; içerik okuma izinleri otomatik verilir.
- **Otomatik HTTPS** — dahili [Caddy](https://caddyserver.com) Let's Encrypt sertifikasını alır ve yeniler.
- **Hızlı** — Next.js 16 App Router, statik üretim + 60 sn'de bir arka planda tazeleme, görseller aynı origin'den optimize edilerek sunulur.
- **Güvenli varsayılanlar** — uygulama container'ları root olmayan kullanıcıyla çalışır, veritabanı ve uygulama portları dışarı açılmaz, her servis yalnızca ihtiyaç duyduğu gizli bilgiyi görür.
- **Tek komutla yedek/geri yükleme** — veritabanı + medya tek arşivde; yerelde yazdığınız içeriği sunucuya taşımak da aynı komut.
- **Platform bağımsız** — macOS, Linux, Windows (WSL/Git Bash). Bilgisayarınızda yalnızca Docker olması yeterli.

## 🧰 Teknoloji yığını

| Alan | Teknoloji |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Stil / UI | Tailwind CSS v4, shadcn/ui (Base UI), Lucide ikonları |
| CMS | Strapi 5 |
| Veritabanı | PostgreSQL 16 + Drizzle ORM (`@repo/db`) |
| Altyapı | Docker Compose, Caddy (otomatik HTTPS), pnpm workspace monorepo |

---

## 💻 Bilgisayarınızda çalıştırın

**Gereken tek şey:** [Docker Desktop](https://docs.docker.com/get-docker/) (Linux'ta Docker Engine + Compose v2) ve git.
Node.js veya pnpm kurmanız gerekmez.

```bash
git clone https://github.com/bilalgursen/Blog.git
cd Blog
./blog dev
```

Bu komut sırasıyla:

1. `.env` dosyalarını rastgele gizli anahtarlarla oluşturur,
2. PostgreSQL, Strapi ve Next.js container'larını derleyip başlatır,
3. hepsi hazır olana kadar bekler ve adresleri yazdırır.

| Servis | Adres |
| --- | --- |
| Blog | http://localhost:3000 |
| Strapi admin | http://localhost:1337/admin |

İlk açılış birkaç dakika sürebilir (bağımlılıklar + Strapi admin paneli derlemesi); sonraki açılışlar saniyeler içindedir.
Kodda yaptığınız değişiklikler anında yansır (hot-reload).

> **Windows:** Komutları **WSL** veya **Git Bash** içinde çalıştırın. `./blog` çalışmazsa `sh blog dev` yazın.

## 📝 Siteye ilk içeriği ekleyin

1. **http://localhost:1337/admin** adresinde yönetici hesabınızı oluşturun.
2. **Content Manager → Profile**: adınızı, rolünüzü ve tanıtım metninizi yazın → *Save*.
3. **Content Manager → Article → Create new entry**: başlık, özet, kapak görseli ve içerik ekleyin → *Publish*.
   Ana sayfada en üstte görünmesini istediğiniz yazıda **featured** seçeneğini açın.
4. Siteyi yenileyin — yazı en geç **60 saniye** içinde görünür.

> İçerik okuma izinleri (Public rolü) ve varsayılan profil ilk açılışta otomatik ayarlanır; Strapi'de ek ayar gerekmez.

---

## 🚀 Sunucuya yayınlayın

### Gereksinimler

- Bir **Linux sunucu** (Ubuntu 22.04+ önerilir) — **2 vCPU, 4 GB RAM** (2 GB RAM + 2 GB swap da yeterli).
- Bir **alan adı** ve iki DNS **A kaydı**, ikisi de sunucunuzun IP adresini göstermeli:
  - `blog.alanadiniz.com` → blog
  - `cms.blog.alanadiniz.com` → Strapi admin paneli (adı değiştirilebilir)
- **80 ve 443** portları açık (bulut sağlayıcınızın güvenlik duvarında da).

> Henüz alan adınız yok mu? `--domain 203.0.113.10.sslip.io` gibi **sslip.io** adresiyle
> (kendi IP'nizi yazarak) DNS ayarı yapmadan, geçerli HTTPS sertifikasıyla deneyebilirsiniz.

### Seçenek 1 — Tek satır (önerilen)

Sunucuya SSH ile bağlanıp çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/bilalgursen/Blog/main/scripts/install.sh \
  | sh -s -- --domain blog.alanadiniz.com
```

Betik git'i (gerekirse) kurar, depoyu `~/blog` klasörüne klonlar ve `./blog deploy`'u çalıştırır.
Docker kurulu değilse resmi betikle kurmayı teklif eder.
Kendi fork'unuzu kurmak için sona `--repo https://github.com/KULLANICI/Blog.git` ekleyin.

### Seçenek 2 — Elle

```bash
git clone https://github.com/bilalgursen/Blog.git blog && cd blog
./blog deploy --domain blog.alanadiniz.com
```

### `./blog deploy` ne yapar?

1. `.env.production` dosyasını oluşturur: veritabanı parolası ve tüm Strapi anahtarları **rastgele** üretilir (dosya yalnızca sahibine okunur, `chmod 600`).
2. Bellek ve DNS kontrolü yapar, sorun görürse uyarır.
3. Üretim imajlarını derler (ilk seferde 3–8 dk) ve servisleri başlatır.
4. Veritabanı, Strapi ve web **sağlıklı** olana kadar bekler; bir şey ters giderse ilgili logları gösterir.
5. Caddy, Let's Encrypt sertifikasını alır; komut sitenin HTTPS üzerinden yanıt verdiğini doğrular.

Sonunda adresleri yazdırır. **Ardından hemen** `https://cms.blog.alanadiniz.com/admin` adresine gidip yönetici hesabınızı oluşturun — panel herkese açıktır, ilk hesabı açan yönetici olur.

### Seçenekler

| Seçenek | Açıklama |
| --- | --- |
| `--domain <alan-adı>` | Blogun adresi |
| `--cms-domain <alan-adı>` | Strapi adresi (varsayılan `cms.<alan-adı>`) |
| `--no-caddy` | Sunucuda zaten Nginx/Traefik vb. varsa: Caddy başlatılmaz, web `127.0.0.1:3000`, Strapi `127.0.0.1:1337` adresinde dinler |
| `-y`, `--yes` | Soruları otomatik onayla (CI/otomasyon için) |

Alan adını sonradan değiştirmek için `./blog deploy --domain yeni.alanadi.com` çalıştırmanız yeterli.
Daha fazla ayrıntı (kendi reverse proxy'niz, swap ekleme, elle yapılandırma): [docs/deployment.md](docs/deployment.md).

---

## 🔄 Güncelleme, yedekleme ve taşıma

```bash
./blog update                  # git pull + yeniden derle + kesintisiz yayına al
./blog backup                  # backups/blog-prod-<tarih>.tar.gz (veritabanı + medya)
./blog restore backups/x.tar.gz
```

**Yerelde yazdığınız içeriği sunucuya taşıyın:**

```bash
# Bilgisayarınızda
./blog backup --dev
scp backups/blog-dev-*.tar.gz kullanici@sunucu:~/blog/backups/

# Sunucuda
./blog restore backups/blog-dev-<tarih>.tar.gz
```

Yazılar, görseller ve admin hesaplarınız birlikte taşınır.

**Otomatik günlük yedek** (sunucuda `crontab -e`):

```cron
0 3 * * * cd ~/blog && ./blog backup --prod -y >> backups/cron.log 2>&1
```

> Yedekler sunucudadır; düzenli olarak başka bir yere (bilgisayarınız, S3, vb.) kopyalayın.

---

## 📖 Komut referansı

| Komut | Açıklama |
| --- | --- |
| `./blog dev` | Yerel geliştirme ortamını kur ve başlat |
| `./blog deploy [--domain …]` | Sunucuda yapılandır, derle, HTTPS ile yayına al |
| `./blog update` | Son sürümü çek ve yeniden yayına al |
| `./blog status` | Servis durumları |
| `./blog logs [servis]` | Canlı loglar (`db`, `cms`, `web`, `caddy`) |
| `./blog start` / `./blog stop` | Başlat / durdur (veriler korunur) |
| `./blog restart [servis]` | Yeniden başlat |
| `./blog backup` | Veritabanı + medya yedeği al |
| `./blog restore <dosya>` | Yedeği (`.tar.gz`) veya SQL dump'ı (`.sql`) geri yükle |
| `./blog reset` | Geliştirme verilerini tamamen sil |
| `./blog help` | Yardım |

Yönetim komutları ortamı kendisi seçer (sunucuda üretim, bilgisayarınızda geliştirme).
Zorlamak için `--dev` veya `--prod` ekleyin.

---

## 🧱 Mimari

```text
                    İnternet (HTTPS)
                          │
                ┌─────────▼─────────┐
                │   Caddy :80/:443  │  Let's Encrypt, HTTP/3, gzip/zstd
                └────┬─────────┬────┘
      blog.alan.com  │         │  cms.blog.alan.com
             ┌───────▼───┐ ┌───▼────────┐
             │ web       │ │ cms        │
             │ Next.js   │─▶ Strapi 5   │  içerik API'si + admin paneli
             │ :3000     │ │ :1337      │
             └─────┬─────┘ └───┬────────┘
                   │           │
                ┌──▼───────────▼──┐
                │ PostgreSQL 16   │  public şeması → Strapi
                │ (dışarı kapalı) │  app şeması    → Drizzle (@repo/db)
                └─────────────────┘
```

- **web**, Strapi'ye container ağı içinden (`http://cms:1337`) ulaşır; medya dosyaları web'in kendi adresinden (`/uploads/...`) proxy'lenir ve `next/image` ile optimize edilir.
- Sayfalar statik üretilir ve 60 sn'de bir arka planda tazelenir; acil güncelleme için `POST /api/revalidate` ([docs/local-development.md](docs/local-development.md)).
- Kalıcı veriler Docker volume'lerindedir: `postgres_data`, `cms_uploads`, `caddy_data`.

### Proje yapısı

```text
Blog/
├── blog                      # Tek komut CLI'ı (dev, deploy, backup...)
├── apps/
│   ├── web/                  # Next.js frontend
│   │   └── src/
│   │       ├── app/          # Sayfalar ve API route'ları
│   │       ├── features/     # Özellik bazlı bileşenler (portfolio, ...)
│   │       ├── components/   # Paylaşılan bileşenler + shadcn/ui
│   │       └── lib/          # Strapi istemcisi, yardımcılar
│   └── cms/                  # Strapi 5 (içerik tipleri: src/api/*)
├── packages/db/              # Drizzle şeması ve istemcisi (@repo/db)
├── docker/                   # Dockerfile'lar, entrypoint, Caddyfile
├── scripts/install.sh        # Sunucuya tek satır kurulum
├── docker-compose.yml        # Geliştirme stack'i
├── docker-compose.prod.yml   # Üretim stack'i
└── docs/                     # Ayrıntılı kılavuzlar
```

---

## 🎨 Özelleştirme

| Ne değiştirmek istiyorsunuz? | Nereye bakın |
| --- | --- |
| Ana sayfa tasarımı | `apps/web/src/features/portfolio/` |
| Yazı detay sayfası | `apps/web/src/app/blog/[slug]/page.tsx` |
| Renkler, fontlar | `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx` |
| Köşe ikonları | `apps/web/public/icons/` ([docs/corner-icons.md](docs/corner-icons.md)) |
| İçerik modelleri (alanlar) | Strapi admin → *Content-Type Builder* (yalnızca `./blog dev` modunda açıktır) |

İçerik modelini değiştirdiğinizde Strapi, `apps/cms/src/api/` altındaki şema dosyalarını günceller.
Bu dosyaları commit'leyip sunucuda `./blog update` çalıştırmanız yeterlidir.

### Docker olmadan geliştirme

Node.js 22+ ve pnpm 10 kuruluysa:

```bash
./blog setup              # .env dosyalarını üret
pnpm install
docker compose up -d db   # yalnızca PostgreSQL
pnpm dev                  # web + cms (daha hafif seçenekler: docs/local-development.md)
```

---

## 🩺 Sorun giderme

| Belirti | Çözüm |
| --- | --- |
| `Docker çalışmıyor` | Docker Desktop'ı açın; Linux'ta `sudo systemctl start docker`. |
| `port is already allocated` (yerel) | `.env` içinde `WEB_PORT`, `CMS_PORT` veya `POSTGRES_PORT` değerini değiştirin. |
| Sunucuda 80/443 kullanımda | Başka bir web sunucusu çalışıyor (`sudo ss -ltnp`). Kapatın ya da `--no-caddy` kullanın. |
| HTTPS sertifikası alınamıyor | DNS kayıtlarını ve 80/443 portlarını kontrol edin: `./blog logs caddy`. |
| Derleme `exit 137` ile düşüyor | Bellek yetersiz; swap ekleyin ([docs/deployment.md](docs/deployment.md#swap-ekleme)). |
| Yazı sitede görünmüyor | *Publish* edildiğinden emin olun; en geç 60 sn bekleyin. |
| Yerelde garip bağımlılık hataları | `pnpm docker:reset:deps` (veritabanına dokunmaz), ardından `./blog dev`. |

Daha fazlası: [docs/docker-setup.md](docs/docker-setup.md) · [docs/deployment.md](docs/deployment.md)

---

## 🤝 Katkıda bulunun

Katkılarınızı bekliyoruz! Hata bildirimi, öneri veya pull request gönderebilirsiniz.

1. Depoyu fork'layın ve bir dal açın: `feat/ozellik-adi`, `fix/hata-adi` veya `docs/dokuman-adi`.
2. `./blog dev` ile geliştirin; göndermeden önce `pnpm typecheck` ve `pnpm build:web` çalıştırın.
3. Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) kullanın: `feat(blog): yazı arama eklendi`.
4. Pull request açın.

Projede kullanılan teknolojiler ve kodlama kuralları `.claude/CLAUDE.md` ve `.claude/rules/` altında belgelenmiştir.

---

## 🇬🇧 Quick start (English)

**Requirements:** Docker (Desktop on macOS/Windows, Engine + Compose v2 on Linux) and git.

```bash
# Local development (hot reload) → http://localhost:3000, admin at http://localhost:1337/admin
git clone https://github.com/bilalgursen/Blog.git && cd Blog
./blog dev

# Production on a Linux server (needs DNS A records for blog.example.com and cms.blog.example.com,
# ports 80/443 open). Generates all secrets, builds, starts, and gets HTTPS certificates via Caddy.
curl -fsSL https://raw.githubusercontent.com/bilalgursen/Blog/main/scripts/install.sh \
  | sh -s -- --domain blog.example.com

# Day-2 operations
./blog update      # pull latest code and redeploy
./blog backup      # database + media archive in backups/
./blog restore <file>
./blog help
```

After deploying, open `https://cms.<your-domain>/admin` right away and create the admin account.
Edit **Profile** and publish **Articles** from the Strapi Content Manager.

---

## 📄 Lisans

[MIT](LICENSE) — dilediğiniz gibi kullanın, değiştirin ve paylaşın.
