# Monorepo Kurulumu (Strapi + Next.js + Postgres + Drizzle)

Proje, **pnpm workspace** tabanlı bir monorepo'ya dönüştürüldü.

## Yapı

```text
Blog/
├── apps/
│   ├── web/        # Next.js 16 (frontend) — eski kök proje buraya taşındı
│   └── cms/        # Strapi 5 (içerik yönetimi + admin)
├── packages/
│   └── db/         # Drizzle ORM (@repo/db) — paylaşılan şema + DB client
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json    # kök scriptler
```

## Veri Katmanı

- **Strapi** → PostgreSQL `public` şeması (içerik: yazı, kategori, medya). Kendi `apps/cms/.env` dosyasını kullanır.
- **Drizzle** (`@repo/db`) → aynı PostgreSQL'in `app` şeması (kullanıcı, yorum, favori). Kök `.env`'deki `POSTGRES_*` değişkenlerini kullanır.
- İki katman ayrı şemalarda olduğu için çakışmaz; Drizzle migration'ları `schemaFilter: ["app"]` ile sınırlandırıldı.

## Komutlar (kökten)

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | web + cms birlikte (paralel) |
| `pnpm dev:web` | sadece Next.js (`:3000`) |
| `pnpm dev:cms` | sadece Strapi (`:1337`) |
| `pnpm db:generate` | Drizzle migration üret |
| `pnpm db:migrate` | Migration uygula |
| `pnpm db:studio` | Drizzle Studio |
| `docker compose up -d` | PostgreSQL'i başlat |

## Web içinden DB kullanımı

```ts
import { db, users } from "@repo/db"

const allUsers = await db.select().from(users)
```

## Bilinen / Bekleyen Konular

- `apps/web/src/components/ui/calendar.tsx`: `react-day-picker` v10 API değişikliği nedeniyle tip hatası (geçişten bağımsız, mevcut sorun).
- Strapi içerik tipleri (Article, Category, Tag) henüz oluşturulmadı — admin panelinden veya `apps/cms/src/api` altından eklenecek.
