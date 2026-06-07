# Blog Monorepo

Next.js 16 (frontend) + Strapi 5 (CMS) + PostgreSQL + Drizzle ORM tabanlı pnpm workspace monorepo.

## Gereksinimler

- Node.js >= 22
- pnpm >= 10
- Docker (bu projede [Colima](https://github.com/abiosoft/colima) ile kullanılıyor)

## İlk kurulum

```bash
pnpm install
cp .env.example .env
cp apps/cms/.env.example apps/cms/.env
# .env ve apps/cms/.env dosyalarındaki veritabanı bilgilerini düzenleyin
```

## Geliştirme ortamını başlatma

Strapi PostgreSQL'e bağlıdır. **Önce veritabanını, sonra uygulamayı** başlatın:

```bash
colima start
docker compose up -d
pnpm dev
```

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | Next.js + Strapi birlikte |
| `pnpm dev:web` | Sadece Next.js |
| `pnpm dev:cms` | Sadece Strapi |

## Portlar

| Uygulama | Adres |
| --- | --- |
| Next.js (web) | http://localhost:3000 |
| Strapi (CMS API) | http://localhost:1337/api |
| Strapi (admin panel) | http://localhost:1337/admin |

## `localhost:1337` bağlantı reddedildi hatası

Port yanlış değildir; Strapi **veritabanına bağlanamadığı için hiç başlamamıştır**. Bu durumda 1337 portunda dinleyen bir süreç olmaz ve tarayıcı "bağlanmayı reddetti" der.

**Sebep:** Colima/Docker kapalıyken veya PostgreSQL container'ı çalışmıyorken `pnpm dev` çalıştırıldığında Strapi `ECONNREFUSED` hatasıyla kapanır. Next.js veritabanına ihtiyaç duymadığı için `:3000` açık kalabilir; bu yüzden sadece Strapi tarafı çalışmıyor gibi görünür.

**Çözüm:**

```bash
colima start
docker compose up -d
pnpm dev
```

Terminalde `Strapi started successfully` ve `http://localhost:1337/admin` satırlarını görmelisiniz.

**Kontrol:**

```bash
docker ps   # blog_postgres_container "healthy" olmalı
```

## Diğer komutlar

```bash
pnpm db:generate   # Drizzle migration üret
pnpm db:migrate    # Migration uygula
pnpm db:studio     # Drizzle Studio
```

Detaylı monorepo yapısı için: [docs/monorepo-setup.md](docs/monorepo-setup.md)
