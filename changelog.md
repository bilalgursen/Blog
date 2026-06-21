# Changelog

## 2026-06-21

- **perf(web): Strapi webhook revalidation kaldırıldı; zaman temelli yenilenmeye geçildi.**
  - `apps/web/src/lib/strapi.ts`: içerik `revalidate: 60` ile dakikada bir tazelenir (stale-while-revalidate; Strapi yükü trafikten bağımsız, route başına ~1 istek/dk). Her publish/update'te revalidation tetikleyen otomatik webhook kaldırıldı.
  - `apps/web/src/app/api/revalidate/route.ts`: endpoint korunuyor ama artık **manuel on-demand** kullanım için (acil düzenleme); doküman yorumları güncellendi.
  - `docs/local-development.md`: revalidation bölümü webhook kurulumundan manuel `curl` tetiklemeye göre yeniden yazıldı.
  - Strapi admin panelinde tanımlı webhook'un **elle silinmesi** gerekir (Settings → Webhooks).

- **fix(cms): Public role'e blog okuma izinleri bootstrap'ta otomatik verildi (403 düzeltmesi).**
  - `apps/cms/src/index.ts` `bootstrap`: Public role'e `article`, `category`, `tag` için `find`/`findOne` izinleri idempotent şekilde eklenir.
  - Sebep: taze bir veritabanında (örn. Docker'ın kendi Postgres'i) bu izinler yoktu; frontend'in `/api/articles` istekleri **403** dönüyordu. Native ve Docker ayrı DB kullandığı için sorun yalnızca Docker'da görülüyordu.
  - Artık her açılışta eksik izinler tamamlanır; elle Strapi admin'den ayarlamaya gerek yok.

- **feat(web): Strapi publish → anında frontend güncellemesi (on-demand revalidation).**
  - `apps/web/src/app/api/revalidate/route.ts`: `REVALIDATE_SECRET` ile doğrulanan POST endpoint; `revalidateTag("articles")` çağırır.
  - `apps/web/src/lib/strapi.ts`: tüm article fetch'leri `tags: ["articles"]` ile etiketlendi (`ARTICLES_TAG` export). `revalidate: 60` güvenlik ağı olarak kaldı.
  - `.env` / `.env.example`: `REVALIDATE_SECRET` eklendi.
  - Kurulum: Strapi admin → Settings → Webhooks → publish/update olayında `POST {WEB_URL}/api/revalidate?secret=...` tetiklenir. Detay: `docs/local-development.md`.
  - Not: native `pnpm dev:web` ile Docker web container'ı aynı anda çalıştırılırsa `.next` (bind-mount) bozulur → Turbopack cache hatası. İkisi birlikte çalıştırılmamalı.

- **perf(web): editör performansı + Strapi'siz çalışma düzeltildi.**
  - `.vscode/settings.json` eklendi: `node_modules`, `.next`, `.turbo`, `.strapi`, `dist` klasörleri dosya izleyici/arama/TS dışına alındı (Cursor'ın sürekli yüksek CPU tüketimi giderildi).
  - `apps/web/src/lib/strapi.ts`: CMS'e ulaşılamadığında (`pnpm dev:web` tek başına) artık hata fırlatmıyor; uyarı loglayıp boş veri dönüyor. Böylece ana sayfa ve `/blog` Strapi kapalıyken de açılıyor (500 yerine 200).

- **docs(dev): yerel geliştirme & performans rehberi + hafif dev scriptleri eklendi.**
  - `pnpm dev`'in iki ağır sunucuyu (Next.js + `strapi develop`) paralel çalıştırdığı, bu yüzden makineyi zorladığı açıklandı.
  - `package.json`: `dev:cms:start` (Strapi'yi bir kez build edip watch'sız çalıştırır) ve `dev:light` (Strapi watch'sız + Next dev birlikte, `Ctrl+C` ile temiz kapanış) scriptleri eklendi.
  - Dokümantasyon: `docs/local-development.md` — komut karşılaştırma tablosu, `dev:light` çalışma mantığı ve hızlı teşhis (Activity Monitor / `top`).

- **docs(deploy): sunucu (production) yayına alma kurulumu + üretim Docker dosyaları eklendi.**
  - `docker/Dockerfile.prod`: multi-stage; `web` (Next.js standalone) ve `cms` (Strapi, `pnpm deploy --prod`) target'ları.
  - `docker-compose.prod.yml`: db + cms + web üretim stack'i; portlar `127.0.0.1`'e bağlı (reverse proxy önünde).
  - `apps/web/next.config.ts`: `output: "standalone"` + `outputFileTracingRoot` (monorepo) — ince çalıştırma imajı.
  - `package.json`: `docker:prod:up|down|logs` scriptleri.
  - `.env.example`: `NEXT_PUBLIC_STRAPI_URL` + `STRAPI_API_TOKEN` ve build-time/runtime URL açıklaması.
  - Dokümantasyon: `docs/deployment.md` (gereksinimler, env, adımlar, reverse proxy/HTTPS, migration, yedekleme, sorun giderme).

- **fix(docker): web ↔ Strapi ve cms ↔ Postgres servis-içi ağ erişimi düzeltildi.**
  - `cms`: `POSTGRES_HOST: db` eklendi — `.env`'deki `localhost` sızması nedeniyle cms `localhost:5432`'yi sonsuza dek bekliyordu.
  - `web`: `STRAPI_INTERNAL_URL: http://cms:1337` eklendi; `src/lib/strapi.ts` server-side fetch için `SERVER_STRAPI_URL` ayrımı yapıldı (public `NEXT_PUBLIC_STRAPI_URL` tarayıcı/medya URL'leri için korundu).
  - `docs/docker-setup.md`: ortam değişkenleri tablosu ve sorun giderme (CMS bekleme, `motion/react` not found, `ECONNREFUSED 1337`) güncellendi.

## 2026-06-10

- **chore(web): shadcn UI bileşenleri registry'den yeniden kuruldu (`base-maia`).**
  - 32 dosyalık manuel React 19 patch geri alındı (`55688e9`).
  - `shadcn add --all --overwrite` ile 55 bileşen temiz kurulum.
  - `calendar.tsx`: react-day-picker v10 uyumu (`table` → `month_grid`).
  - `layout.tsx`: `TooltipProvider` eklendi.

- **docs(readme): kök README monorepo yapısına göre güncellendi.**
  - Teknoloji yığını, proje yapısı, Docker/yerel kurulum, komutlar ve veri katmanı özeti eklendi.

- **feat(docker): tam stack docker compose kurulumu eklendi.**
  - `docker/Dockerfile` (dev target) ve `docker/entrypoint.sh` — monorepo pnpm kurulumu.
  - `docker-compose.yml` güncellendi: `db` + `cms` + `web` servisleri.
  - `.dockerignore`, güncellenmiş `.env.example` ve `apps/cms/.env.example`.
  - Kök scriptler: `docker:up`, `docker:up:detach`, `docker:down`, `docker:logs`, `docker:reset`.
  - Dokümantasyon: `docs/docker-setup.md`.
  - `apps/web/next.config.ts`: Docker prod build için `output: "standalone"`.

## 2026-06-06

- **refactor(ui): shadcn bileşenleri Radix yerine Base UI'a geçirildi.**
  - `components.json` stili `radix-maia` → `base-maia`; alias'lar `@/src/*` ile, css `src/app/globals.css` ile düzeltildi.
  - 33 bileşen `base-maia` ile yeniden üretildi (artık `@base-ui/react` import ediyor); `radix-ui` bağımlılığı kaldırıldı.
  - `calendar.tsx`: react-day-picker v10 uyumu için geçersiz `table` anahtarı `month_grid` ile değiştirildi.

- **chore(monorepo): pnpm workspace yapısına geçildi.**
  - Mevcut Next.js uygulaması `apps/web/` altına taşındı.
  - `apps/cms/` altına Strapi 5 (PostgreSQL) kuruldu.
  - `packages/db/` altında Drizzle ORM paketi (`@repo/db`) oluşturuldu (`app` şeması).
  - Kök `package.json` workspace scriptleriyle güncellendi; `pnpm-workspace.yaml` `apps/*` + `packages/*`.
  - `docker-compose.yml` `.env` (`POSTGRES_*`) ile hizalandı; `onlyBuiltDependencies` ayarlandı.
  - Mimari kuralı eklendi: `.cursor/rules/context/monorepo-structure.mdc`.
  - Dokümantasyon: `docs/monorepo-setup.md`.
