# Blog Monorepo

Next.js tabanlı blog uygulaması. İçerik **Strapi 5** ile yönetilir; ilişkisel uygulama verisi **PostgreSQL** üzerinde **Drizzle ORM** ile tutulur. Proje **pnpm workspace** monorepo mimarisinde çalışır.

## Teknoloji Yığını

| Alan | Teknoloji |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| CMS | Strapi 5 |
| Veritabanı | PostgreSQL 16 |
| ORM | Drizzle (`@repo/db`) |
| Stil | Tailwind CSS v4, shadcn/ui (Base UI) |
| State | Zustand |
| Paket yöneticisi | pnpm |

## Proje Yapısı

```text
Blog/
├── apps/
│   ├── web/          # Next.js frontend (http://localhost:3000)
│   └── cms/          # Strapi admin + API (http://localhost:1337)
├── packages/
│   └── db/           # Drizzle şema, migration ve client (@repo/db)
├── docker/           # Dockerfile ve entrypoint
├── docs/             # Kurulum kılavuzları
├── docker-compose.yml
└── package.json      # Kök workspace scriptleri
```

## Gereksinimler

- **Node.js** ≥ 22
- **pnpm** 10.x
- **Docker** (Compose v2) — tam stack veya yalnızca PostgreSQL için

## Hızlı Başlangıç

### Docker ile (önerilen)

Node.js veya pnpm kurulumu gerekmez; tüm servisler container içinde çalışır.

```bash
cp .env.example .env
docker compose up --build
# veya arka planda:
pnpm docker:up:detach
```

| Servis | URL |
| --- | --- |
| Next.js | http://localhost:3000 |
| Strapi admin | http://localhost:1337/admin |
| PostgreSQL | localhost:5432 |

İlk Strapi açılışında admin panelinden yönetici hesabı oluşturun.

### Yerel geliştirme

```bash
cp .env.example .env
cp apps/cms/.env.example apps/cms/.env
pnpm install
docker compose up -d db   # yalnızca PostgreSQL
pnpm dev                  # web + cms paralel
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | web + cms birlikte |
| `pnpm dev:web` | yalnızca Next.js |
| `pnpm dev:cms` | yalnızca Strapi |
| `pnpm build` | tüm uygulamaları derle |
| `pnpm db:generate` | Drizzle migration üret |
| `pnpm db:migrate` | migration uygula |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm docker:up` | Docker stack (ön planda) |
| `pnpm docker:down` | container'ları durdur |
| `pnpm docker:reset` | container + volume sil (DB sıfırlanır) |

## Veri Katmanı

Strapi ve Drizzle aynı PostgreSQL veritabanını paylaşır; şema sorumlulukları ayrıdır:

| Katman | Şema | Örnek veri | Erişim |
| --- | --- | --- | --- |
| Strapi | `public` | Yazılar, kategoriler, medya | Strapi REST/GraphQL API |
| Drizzle | `app` | Kullanıcı, yorum, favori | `@repo/db` (server-side) |

Web uygulamasından Drizzle kullanımı:

```ts
import { db, users } from "@repo/db"

const allUsers = await db.select().from(users)
```

## UI Bileşenleri

shadcn/ui bileşenleri `apps/web/src/components/ui/` altındadır. Yeni bileşen eklemek için `apps/web` dizininde:

```bash
pnpm --filter web exec shadcn add button
```

## Dokümantasyon

- [Monorepo kurulumu](docs/monorepo-setup.md)
- [Docker tam stack kılavuzu](docs/docker-setup.md)

## Lisans

Private proje.
