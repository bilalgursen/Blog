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

## Sıfırdan Kurulum

En kolay yol Docker'dır: makinede yalnızca **Git** ve **Docker (Compose v2)**
olması yeterlidir — Node.js veya pnpm kurmanız gerekmez.

### 1. Projeyi klonlayın

```bash
git clone https://github.com/bilalgursen/Blog.git
cd Blog
```

### 2. Ortam dosyalarını oluşturun

```bash
sh scripts/setup.sh
```

Bu komut `.env` ve `apps/cms/.env` dosyalarını şablonlardan üretir ve tüm
gizli anahtarları (Strapi secret'ları vb.) otomatik doldurur. Elle hiçbir
değer girmeniz gerekmez; tekrar çalıştırmak var olan dosyalara dokunmaz.

### 3. Projeyi başlatın

```bash
docker compose up --build
```

İlk açılış: bağımlılıklar imajdaki hazır paket deposundan kurulur (~saniyeler)
ve Strapi admin paneli bir kez derlenir (1–2 dk). Sonraki açılışlar için
`docker compose up` yeterlidir ve hızlıdır.

### 4. Kullanmaya başlayın

| Servis | URL |
| --- | --- |
| Site (Next.js) | http://localhost:3000 |
| Strapi admin paneli | http://localhost:1337/admin |
| PostgreSQL | localhost:5432 |

- İlk açılışta http://localhost:1337/admin adresinden **yönetici hesabı oluşturun**.
- Content Manager'dan **Profile** bilgilerinizi girin, **Article** ekleyip
  **Publish** edin — yazı ve görselleri http://localhost:3000 üzerinde görünür.

Hepsi bu kadar. 🎉

### Alternatif: Docker'sız yerel geliştirme

Host'ta çalıştırmak isterseniz **Node.js ≥ 22** ve **pnpm 10.x** gerekir
(Postgres yine Docker'dan gelir):

```bash
git clone https://github.com/bilalgursen/Blog.git && cd Blog
pnpm bootstrap            # .env dosyalarını üretir (= sh scripts/setup.sh)
pnpm install
docker compose up -d db   # yalnızca PostgreSQL
pnpm dev                  # web + cms paralel
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm bootstrap` | `.env` dosyalarını üret (secret'larla, idempotent) |
| `pnpm dev` | web + cms birlikte |
| `pnpm dev:web` | yalnızca Next.js |
| `pnpm dev:cms` | yalnızca Strapi |
| `pnpm build` | tüm uygulamaları derle |
| `pnpm db:generate` | Drizzle migration üret |
| `pnpm db:migrate` | migration uygula |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm docker:up` | Docker stack (ön planda) |
| `pnpm docker:down` | container'ları durdur |
| `pnpm docker:reset` | container + **tüm** volume'ları sil (DB dahil sıfırlanır) |
| `pnpm docker:reset:deps` | yalnızca bağımlılık volume'larını sil (DB verisi korunur) |

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
