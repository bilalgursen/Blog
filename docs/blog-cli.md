# `./blog` CLI — Tek Komutla Kurulum ve Yayın

Kökteki `blog` betiği, projeyi yerelde çalıştırmayı ve sunucuda yayına almayı
tek komuta indirir. Yalnızca **POSIX sh + Docker** gerektirir (macOS, Linux,
WSL, Git Bash); Node.js/pnpm gerekmez.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `dev` | `.env`'leri üretir → `docker compose up -d --build` → servisler healthy olana kadar bekler → adresleri yazar |
| `setup` | Yalnızca `.env` + `apps/cms/.env` üretir (`pnpm bootstrap` ve `scripts/setup.sh` bunu çağırır) |
| `deploy` | `.env.production`'ı üretir/günceller → ön kontroller → derle → başlat → sağlık bekle → içerik cache'ini tazele → HTTPS doğrula |
| `update` | `git pull --ff-only` → betiğin yeni sürümüyle yeniden çalışır → taban imajları çeker → `deploy` |
| `status`, `logs`, `start`, `stop`, `restart` | Compose sarmalayıcıları |
| `backup` / `restore` | `pg_dump` + medya `tar` → tek `.tar.gz`; geri yüklemede DB sıfırdan oluşturulur |
| `reset` | Yalnızca geliştirmede: tüm volume'ları siler |

## Tasarım kararları

- **Ortam seçimi:** `dev`/`deploy`/`update` açıktır. Diğer komutlar `--dev`/`--prod`
  verilmezse ortamı tahmin eder: `.env.production` varsa ve (üretim container'ları
  varsa ya da geliştirme container'ları yoksa) → `prod`, aksi halde `dev`.
- **Ayrı proje adları:** geliştirme `blog`, üretim `blog-prod`. Aynı makinede
  ikisinin de verisi tutulabilir; volume'ler karışmaz. (Aynı anda çalıştırmak
  için portlar çakışır — birini durdurun ya da `.env`'de portları değiştirin.)
- **Override dosyaları:** `docker-compose.override.yml` (dev) ve
  `docker-compose.prod.override.yml` (prod) varsa CLI bunları otomatik ekler.
  Git'e girmezler; sunucuya özel ayarlar (kaynak limitleri, ek değişkenler) için.
- **Secret'lar:** `openssl rand -hex` (yoksa `/dev/urandom`). Yalnızca boş ya da
  `changeMe…` değerler doldurulur — mevcut değerler asla değişmez.
  `.env.production` `umask 077` ile oluşturulur.
- **Sağlık bekleme:** Docker HEALTHCHECK durumları (`/_health`, `/api/health`,
  `pg_isready`) okunur; servis `unhealthy`/`exited` olursa ya da 3 kez yeniden
  başlarsa son 40 log satırı basılıp çıkılır.
- **Etkileşim:** sorular `/dev/tty`'den okunur, bu yüzden `curl … | sh` ile de
  çalışır. `-y` tüm onayları geçer; TTY yoksa ve alan adı verilmemişse hata verir.
- **Windows:** `MSYS_NO_PATHCONV=1` ile Git Bash'in container yollarını
  (`/app/...`) Windows yoluna çevirmesi engellenir; `.gitattributes` betikleri LF tutar.

## İlgili dosyalar

- `blog` — CLI
- `scripts/install.sh` — sunucuya tek satır kurulum (git kur → klonla → `./blog deploy`)
- `scripts/setup.sh` — geriye dönük uyumluluk (`./blog setup`)
- `.env.production.example` — üretim değişken şablonu
- `docker/caddy/Caddyfile` — otomatik HTTPS
- Ayrıntılar: [deployment.md](deployment.md), [docker-setup.md](docker-setup.md)
