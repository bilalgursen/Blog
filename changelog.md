# Changelog

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
