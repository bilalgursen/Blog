---
description: Proje genel geçer AI kuralları ve teknoloji standartları
alwaysApply: true
---

# 🧠 AI Destekli Proje Geliştirme Kılavuzu (Güncel: Next.js + Strapi + Postgres + Zustand)

Bu doküman, proje kapsamında yapay zekanın (AI) hangi araçları, sınırlamaları ve kuralları izleyerek üretim yapacağını **kesin ve bağlayıcı** şekilde tanımlar. Yapay zeka, bu dokümanda belirtilmeyen hiçbir teknoloji, stil sistemi ya da yöntemle çalışamaz.

---

## ❌ Genel Uyarı: Katı Kurallar

✅ Sadece belirtilen teknolojiler, bileşenler ve yapılar kullanılabilir.
❌ Farklı teknoloji veya araçlar önerilemez.
❌ AI, kendi yorumunu veya alternatif çözümünü **sunamaz, uygulayamaz**.

---

## 🛠️ Kullanılacak Teknolojiler

| Alan                     | Teknoloji                                                              |
| ------------------------ | ---------------------------------------------------------------------- |
| Paket Yöneticisi         | [pnpm](https://pnpm.io/)                                               |
| Framework                | [Next.js (App Router)](https://nextjs.org/)                            |
| Programlama Dili         | [TypeScript](https://www.typescriptlang.org/)                          |
| Stil Sistemi             | [Tailwind CSS v4](https://tailwindcss.com/)                            |
| UI Bileşen Kitaplığı     | [shadcn/ui](https://ui.shadcn.dev/)                                    |
| Alt Yapı Kitaplığı       | [Base UI](https://base-ui.com/)                                        |
| İkon Kütüphanesi         | [Lucide Icons](https://lucide.dev/) (`lucide-react` — Lucide görünümü) |
| İçerik Yönetimi (CMS)    | [Strapi](https://strapi.io/)                                           |
| Veritabanı               | [PostgreSQL](https://www.postgresql.org/)                              |
| ORM (Veritabanı Köprüsü) | [Drizzle ORM](https://orm.drizzle.team/)                               |
| State Management         | [Zustand](https://zustand-demo.pmnd.rs/)                               |
| Animasyon Sistemi        | [Motion](https://motion.dev/docs/react)                                |

> **Bu teknolojiler dışındaki her şey yasaktır.**

---

## 🧱 UI Bileşen Sistemi (shadcn/ui)

Tüm `shadcn/ui` bileşenleri projeye yüklenmiştir:
📁 `components/ui` · stil: `radix-maia` · ikon: `lucide-react`

AI, ihtiyaç duyulan UI bileşenini **doğrudan bu dizinden içe aktarmalıdır** ve sadece aşağıdaki listede belirtilen bileşenleri kullanabilir:

### Temel Bileşenler

> `Accordion`, `Alert`, `Alert Dialog`, `Aspect Ratio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Button Group`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Combobox`, `Command`, `Context Menu`, `Dialog`, `Direction`, `Drawer`, `Dropdown Menu`, `Empty`, `Field`, `Hover Card`, `Input`, `Input Group`, `Input OTP`, `Item`, `Kbd`, `Label`, `Menubar`, `Native Select`, `Navigation Menu`, `Pagination`, `Popover`, `Progress`, `Radio Group`, `Resizable`, `Scroll Area`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toggle`, `Toggle Group`, `Tooltip`

### Yardımcı Hook

> `useIsMobile` → `@/hooks/use-mobile`

### Notlar

- **Toast** yerine **`Sonner`** kullanılır (`@/components/ui/sonner`).
- **Tarih seçici** için **`Calendar`** bileşeni kullanılır.
- **`Tooltip`** kullanımında uygulama `TooltipProvider` ile sarmalanmalıdır.
- **`Form`** ve **`Data Table`** bileşenleri henüz yüklü değildir; form ihtiyaçları için `Field` + `react-hook-form` + `zod` kullanılır.

🛈 Bu liste dışındaki bileşenler yalnızca proje sahibinin izniyle kullanılabilir.
🛠️ Listede olmayan bir UI ihtiyacı varsa, **sıfırdan Tailwind ile yazmalısın.**

### İkonlar (Lucide Icons)

- Tüm ikonlar **`lucide-react`** (Lucide uyumlu) üzerinden kullanılır. Örnek: `import { User } from "lucide-react"`.
- Dinamik ikon prop tipleri için `IconType` kullanılmalıdır.

---

## 📁 Proje Dosya Yapısı Kuralları (Next.js App Router)

- `app/` → Sayfalar, Route'lar ve API endpoint'leri (App Router standartları)
- `components/ui/` → shadcn/ui bileşenleri
- `components/shared/` → Projeye özel, tekrar kullanılabilir ortak bileşenler
- `features/` → Özelleşmiş işlemsel ve domaine ait bileşenler (Örn: `features/blog`)
- `hooks/` → Paylaşılan React hook'ları (Örn: `use-mobile.ts`)
- `lib/` → Yardımcı fonksiyonlar (utils), sabitler ve yapılandırmalar
- `store/` → **Zustand** global state yönetim dosyaları (Örn: `useAuthStore.ts`)
- `db/` → Drizzle ORM şemaları (`schema.ts`) ve veritabanı bağlantı ayarları

Kodlar **yeniden kullanılabilir**, **modüler**, **okunabilir** ve **Type-Safe** olmalıdır.

---

## 🌿 Branch ve Commit Kuralları (Feature-Based)

`main` branch üzerinde doğrudan geliştirme yapılmaz. Yeni işler için dal (branch) açılması zorunludur.

### Branch Açma Kuralları

- Özellik (Feature): `feat/<feature-adi>`
- Hata (Fix): `fix/<hata-adi>`
- Doküman (Docs): `docs/<dokuman-adi>`

### Commit Mesajı Kuralları (Conventional Commits)

Zorunlu format: `<type>(opsiyonel-scope): <kisa-aciklama>`
Örnek: `feat(blog): add article detail page`

---

## ✅ Uygun Davranış Örnekleri / ❌ Yasaklı Davranışlar

| Görev / İhtiyaç     | Yapılması Gereken (Doğru)                                              | Yapılmaması Gereken (Yanlış)                                                                    |
| :------------------ | :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Global State**    | `Zustand` store'ları oluşturulmalı (`store/` altında)                  | Redux, Context API, Jotai, Recoil kullanımı                                                     |
| **Form Yönetimi**   | `react-hook-form` + `zod` + shadcn `Field` bileşenleri                 | Native form state'i veya Formik kullanımı                                                       |
| **Stil / CSS**      | Tailwind CSS utility class'ları, `clsx`, `twMerge`                     | Vanilla CSS, SCSS, Styled Components, inline stil                                               |
| **Veri Çekme**      | Next.js Server Components, Server Actions, Strapi API Fetch            | Client-side eski tip `useEffect` fetch işlemleri                                                |
| **Tarih İşlemleri** | `date-fns` kütüphanesi                                                 | `moment.js` veya karmaşık native Date modifikasyonları                                          |
| **Veritabanı**      | Drizzle `schema.ts` üzerinden Code-First yaklaşımı                     | Doğrudan pgAdmin ile manuel tablo oluşturma tavsiyesi                                           |
| **Animasyon**       | **Motion** (`motion/react`): `motion.*`, `AnimatePresence`, `layoutId` | Framer Motion eski API, GSAP, React Spring, salt CSS `@keyframes`/`transition` ile sayfa geçişi |

---

## 📊 Veri ve Backend Yönetimi

- **CMS & API:** İçerik yönetimi (Blog yazıları, kategoriler vb.) **Strapi** üzerinden yönetilecek. Veri çekme işlemleri Strapi REST/GraphQL API kullanılarak yapılacak.
- **Veritabanı:** İlişkisel veriler **PostgreSQL** üzerinde tutulacak.
- **ORM:** Veritabanı sorguları ve şema yönetimi için **Drizzle ORM** kullanılacak. Saf SQL yazılmayacak.
- **State Yönetimi:** Proje içi istemci (client) tarafındaki küresel durumlar (Kullanıcı oturumu, tema seçimi, sepet/favori vb.) **Zustand** ile yönetilecek. Her mantıksal parça için ayrı bir store (örn: `useUIStore`, `useUserStore`) oluşturulacak.

---

## 🎬 Animasyon Sistemi (Motion)

Tüm animasyon ve geçişler **yalnızca [Motion](https://motion.dev/docs/react)** (`motion/react`) ile yapılır. Başka animasyon kütüphanesi (GSAP, React Spring, eski `framer-motion` paketi) veya sayfa geçişi için salt CSS kullanılmaz.

- **Bileşenler:** `import { motion, AnimatePresence } from "motion/react"`. Animasyonlu elemanlar `motion.div`, `motion.*`; özel bileşenler için `motion.create(Component)`.
- **Client sınırı:** Motion bileşenleri yalnızca `"use client"` dosyalarında. Server Component sayfaları, animasyonu küçük client sarmalayıcılara (örn. `components/motion.tsx`) devreder.
- **Sayfa geçişleri:** Detay/liste **ayrı sayfalardır**; geçiş efekti hedef sayfada `initial`/`animate`/`transition` ile **giriş animasyonu** olarak verilir (listede `index` tabanlı stagger).
- **Paylaşılan eleman morph (`layoutId`):** Yalnızca kaynak ve hedef **aynı anda mount** olduğunda çalışır (örn. tek sayfa içi açılır panel). Tam sayfa navigasyonunda kullanılmaz.
- **Easing standardı:** `[0.22, 1, 0.36, 1]`, tipik süre `0.3–0.5s`.

---

## 📲 Yapay Zeka (AI) İş Akışı ve Raporlama

Bu kılavuz, AI'nın proje geliştirme sürecinde sınırlarını kesin olarak belirler. Kuralların dışına çıkılması durumunda AI çıktıları geçersiz sayılır.

Yapay zekanın rolü:

1. **Üretim:** Gereken özelliği eksiksiz, Next.js Server/Client component kurallarına uyarak geliştir.
2. **Standartlar:** Kodlama, tasarım ve organizasyon kurallarına tam uyum sağla.
3. **Yorumsuzluk:** Görevi öznel değerlendirmelerden arındırarak sadece istenenleri yap.
4. **Dokümantasyon (Zorunlu):** Her yeni özellik tamamlandığında, `docs/` klasörü altında özelliğin adıyla (örn: `docs/blog-listesi.md`) **kısa ve öz** bir açıklama oluştur.
5. **Takip (Sitemap):** Her önemli dosya değişikliğinde klasör hiyerarşisini güncelle ve kök dizindeki `sitemap.md` (veya `changelog.md`) dosyasına son yaptığın işi mutlaka ekle. Bu sayede projenin neresinde kaldığımızı her zaman bil.
