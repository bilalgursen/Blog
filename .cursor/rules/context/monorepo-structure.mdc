---
description: Monorepo mimarisi (pnpm workspace) — Strapi + Next.js + Postgres + Drizzle
alwaysApply: true
---

# 🏗️ Monorepo Mimarisi (Strapi + Next.js + Postgres + Drizzle)

Bu proje **pnpm workspace** tabanlı bir **monorepo**'dur. Tüm uygulamalar ve paylaşılan paketler tek bir depoda yönetilir. Aşağıdaki yapı **bağlayıcıdır**; yeni dosya/uygulama eklerken bu hiyerarşiye uyulur.

---

## 📦 Üst Seviye Hiyerarşi

```text
Blog/                          # Monorepo kökü (pnpm workspace)
├── apps/
│   ├── web/                   # Next.js 16 (App Router) — frontend / SSR
│   └── cms/                   # Strapi 5 — içerik yönetimi + admin paneli
├── packages/
│   ├── db/                    # Drizzle ORM: schema, migration, client (paylaşılan)
│   ├── ui/                    # Paylaşılan shadcn/ui bileşenleri (opsiyonel)
│   ├── config/                # Paylaşılan tsconfig / eslint / prettier
│   └── types/                 # Paylaşılan tipler (Strapi içerik sözleşmeleri vb.)
├── docker-compose.yml         # PostgreSQL (+ opsiyonel Strapi servisi)
├── pnpm-workspace.yaml        # Workspace tanımı (apps/*, packages/*)
└── package.json               # Kök scriptler (turbo/paralel komutlar)
```

> `pnpm-workspace.yaml` içeriği: `packages: ["apps/*", "packages/*"]`

---

## 🧩 Uygulamalar (`apps/`)

### `apps/web` — Next.js (Frontend)
- Mevcut `src/` yapısı buraya taşınır (`app/`, `features/`, `components/`, `lib/`, `hooks/`, `store/` ...).
- İçeriği **Strapi REST/GraphQL API**'sinden çeker (Server Components / Server Actions ile).
- Uygulamaya özel ilişkisel veriler için `@repo/db` (Drizzle) paketini kullanır.

### `apps/cms` — Strapi (CMS)
- Blog yazıları, kategoriler, etiketler, medya gibi **içerik** modellerini yönetir.
- Kendi veritabanı bağlantısını **aynı PostgreSQL** üzerinde tutar.
- `apps/web` yalnızca API üzerinden tüketir; Strapi tablolarına doğrudan SQL ile dokunulmaz.

---

## 🗄️ Veri Katmanı: Strapi + Drizzle Birlikte Çalışması

İkisi de **aynı PostgreSQL** veritabanına bağlanır ama **sorumlulukları ayrıdır**:

| Katman | Sahiplik | Örnek Veri | Erişim |
| --- | --- | --- | --- |
| **Strapi** | İçerik (CMS) | Yazılar, kategoriler, etiketler, medya | Strapi API (REST/GraphQL) |
| **Drizzle** (`packages/db`) | Uygulama verisi | Kullanıcı, oturum, yorum, favori, beğeni | `apps/web` server-side |

**Çakışma önleme (zorunlu):**
- Strapi kendi tablolarını yönetir; Drizzle **bu tablolara migration yazmaz, değiştirmez**.
- Drizzle tabloları için ayrı bir Postgres `schema` (örn: `app`) veya tablo öneki kullanılır.
- Şema yönetimi **Code-First**: değişiklikler `packages/db/schema.ts` üzerinden, `drizzle-kit` ile migrate edilir.

---

## 🔗 Paylaşılan Paketler (`packages/`)

- İç paket adlandırması: `@repo/<paket>` (örn: `@repo/db`, `@repo/ui`, `@repo/types`).
- `apps/web` içine import: `import { db } from "@repo/db"`.
- Paketler `package.json` `dependencies` içinde `"@repo/db": "workspace:*"` ile referanslanır.

---

## ▶️ Komut Çalıştırma Kuralları

- Belirli bir uygulamada komut: `pnpm --filter web dev`, `pnpm --filter cms develop`.
- Bağımlılık eklemek: `pnpm --filter web add <paket>` (asla kökten global eklenmez).
- Migration: `pnpm --filter @repo/db db:generate` ve `db:migrate`.
- Tüm uygulamaları geliştirme: kök `package.json` üzerinden paralel script (turbo).

---

## ✅ Karar Kuralı (Nereye Yazmalı?)

- Sadece web'e ait UI/iş mantığı → `apps/web/src/features/*`
- Sadece CMS içerik modeli/eklentisi → `apps/cms`
- Birden fazla uygulamanın kullandığı kod/tip/şema → ilgili `packages/*`
- DB şeması/migration → `packages/db` (Strapi tabloları hariç)
