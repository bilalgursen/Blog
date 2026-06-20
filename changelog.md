# Changelog

## 2026-06-21

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
