# Changelog

## 2026-06-27

- **feat(web): imleci takip eden ve tıklanabilir öğelerin şeklini alan özel cursor eklendi.**
  - Yeni `components/shared/custom-cursor.tsx`: boş alanda küçük beyaz nokta olarak fareyi/trackpad'i Motion `useSpring` ile yumuşatarak takip eder; tıklanabilir öğelerin (`a, button, [role=button], input, textarea, select, label, summary, [data-cursor]`) üzerine gelince **o öğenin konumunu, boyutunu ve köşe yarıçapını alıp dolu kutuyla üzerine biner ve `mix-blend-difference` ile içeriği negatife çevirerek kaplar** (yunuses.com benzeri). Scroll/resize'da sarılan öğenin konumu güncel tutulur.
  - **İvme:** boş alanda imlecin anlık hızı `useVelocity` ile ölçülüp yumuşatılarak `scale`'e map edilir; hızlandıkça yuvarlak nokta büyür (`MAX_SPEED`/`MAX_GROWTH` ile ayarlanır), yavaşlayınca eski boyutuna döner. Öğe sarma modunda (`dotMode → 0`) büyüme devre dışıdır ki kutu öğeyi tam kaplasın. Hız, kutunun köşesi yerine **ham imleç konumundan** (`px/py`) ölçülür; böylece öğeye morph sırasındaki konum sıçraması sahte hız üretip absürt büyümeye yol açmaz. `dotMode` boyut spring'iyle aynı tempoda yumuşatılır (`dotModeTarget` → `useSpring`); böylece öğeden **ayrılırken** kutu noktaya dönene kadar hız-büyümesi devreye girmez (ani balon bug'ı önlenir).
  - **Köşe uyumu:** yakalanan öğe yuvarlak olmayan bir sarmalayıcıysa (örn. `<a class="block">`), alanı kaplayan ilk yuvarlak çocuğa (`Card` → `rounded-xl`, globals.css `--radius` türevi) inilir (`visualOf`); böylece kaplama kartların yuvarlak köşelerini tam sarar.
  - **Not:** denenen "dönen dashed (marching-ants) çerçeve" varyantından vazgeçildi; hover'da öğe yine dolu beyaz ile (negatif) kaplanıyor.
  - Yalnızca `pointer: fine` cihazlarda render edilir; dokunmatik cihazlarda ve `prefers-reduced-motion` tercihinde hiç çalışmaz.
  - `app/globals.css`: `html.has-custom-cursor` aktifken native imleç gizlenir (sınıf JS ile yalnızca uygun cihazlarda eklenir).
  - `app/layout.tsx`: `<CustomCursor />` `ThemeProvider` içinde global olarak mount edilir.

- **chore(skills): `ui-ux-pro-max` skill'i projeye özel sadeleştirildi (fazlalık stack'ler kaldırıldı).**
  - `scripts/core.py`: `STACK_CONFIG` 11 stack'ten → yalnızca `react` + `shadcn`'e indirildi. Kaldırılanlar (`html-tailwind`, `nextjs`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `swiftui`, `react-native`, `flutter`) zaten **var olmayan CSV dosyalarına** işaret ediyordu; `--stack html-tailwind` (SKILL.md'nin "default" dediği) bu yüzden hata veriyordu. Artık `--stack` yalnızca `{react, shadcn}` kabul ediyor.
  - `scripts/search.py`: docstring + `--stack` help metni güncellendi.
  - `SKILL.md`: "9 stacks" pazarlaması ve bozuk `html-tailwind` default'u kaldırıldı; frontmatter description, "Available Stacks" tablosu ve örnek iş akışı projenin sabit stack'ine (Next.js + React + Tailwind v4 + shadcn/ui + Base UI + Lucide + Motion) ve blog/portfolio bağlamına göre yeniden yazıldı. İkon rehberi `lucide-react`'e sabitlendi.
  - Domain veri dosyaları (styles, colors, typography, ux, charts…) korundu — bunlar stack'ten bağımsız tasarım zekâsı.

- **refactor(web): ana sayfa sadeleştirildi — dekoratif arka plan ışıkları ve gereksiz animasyonlar kaldırıldı.**
  - `home-showcase.tsx`: arkadaki iki yuvarlak bulanık ışık (`blur-3xl` blob) ve bunlara bağlı parallax (`useScroll`/`useTransform`/`blobY`) kaldırıldı. Hero metnindeki satır satır kademeli (stagger) animasyonlar tek, yumuşak bir açılış fade'ine indirildi. Kart hover'da kalkma (`whileHover y`) ve kapak görselinin hover'da büyümesi (`group-hover:scale-105`) kaldırıldı. Blog kartları artık animasyonsuz, statik akıyor.
  - `landing-page.tsx`: üstteki scroll ilerleme çubuğu (`ScrollProgress`) kaldırıldı.
  - Temizlik: kullanılmayan `components/motion-primitives.tsx` (`Reveal` + `ScrollProgress`) silindi. `prefers-reduced-motion` desteği ve kapak View Transition morph'u korunur.

## 2026-06-22

- **feat(web+cms): hero ile blog tek iç içe akışta birleştirildi; profil CMS'ten gelir (template).**
  - **CMS:** `apps/cms/src/api/profile` — yeni `profile` single-type (`name`, `role`, `tagline`, `intro`, `location`, `available`). `src/index.ts` bootstrap'ı: public `find` izni verir ve **boş veritabanında varsayılan profil seed'ler** (`seedDefaultProfile`) → klon ilk açılışta da hero dolu gelir.
  - **web:** `lib/strapi.ts` → `getProfile()` + `Profile` tipi + `DEFAULT_PROFILE` (CMS erişilemezse şablon varsayılanı). `app/page.tsx` profil ve yazıları paralel çeker.
  - **Birleştirme:** `hero-section.tsx` + `blog-section.tsx` → tek `home-showcase.tsx`. Hero metni ile **öne çıkan (en yeni) yazı yan yana**; kalan yazılar aynı akışta altında. Ayrı section/başlık/separator yok ("iç içe"). Parallax + scroll-reveal + kapak VT morph'u korunur.
  - **Template:** Site sahibi adını/metnini yalnızca Strapi admin → Content Manager → Profile'dan girer; kod değişikliği gerekmez. Detay `docs/landing-portfolio.md`.
  - Temizlik: `features/portfolio/data.ts` kaldırıldı (profil artık CMS).

- **feat(web): showcase → detay geçişine View Transitions morph'u; header ve `/blog` liste sayfası kaldırıldı.**
  - `app/blog/page.tsx` silindi: ayrı "tüm yazılar" liste sayfası kaldırıldı (patlıyordu ve gereksizdi). Yayınlanmış tüm yazılar artık doğrudan ana sayfadaki blog sergisinde listelenir (`app/page.tsx` artık `slice` yapmıyor). `/blog/[slug]` detay sayfası korunur.
  - `landing-nav.tsx` silindi: üst menü (header) kaldırıldı. Container yalnızca `ScrollProgress` + hero + blog sergiler.
  - **View Transitions API:** `components/transition-link.tsx` (`TransitionLink`) navigasyonu `document.startViewTransition` içine alır; `view-transition.ts` `coverVtName(slug)` üretir. Showcase kartının kapak görseli ile detay sayfasının kapağı aynı `view-transition-name`'i taşıyıp sayfa geçişinde morph olur. Detay kapağı, morph bozulmasın diye Motion giriş animasyonundan çıkarıldı.
  - `globals.css`: `::view-transition-*` süre/easing'i proje standardına (`0.4s`, `cubic-bezier(0.22,1,0.36,1)`) çekildi; `prefers-reduced-motion`'da kapatıldı. `scroll-padding-top` 5rem → 2rem (header gitti).
  - `hero-section.tsx`: `/blog` CTA'sı kaldırıldı (tek CTA → `#blog`). `blog-section.tsx`: "Tüm yazılar" butonu kaldırıldı, kartlar `TransitionLink` kullanır.
  - Temizlik: `data.ts` yalnız `profile`; `components/motion.tsx` kullanılmayan `CardLink` çıkarıldı (yalnız `FadeIn` kaldı).
  - Not: `startViewTransition` desteklenmeyen tarayıcıda normal `Link` navigasyonuna düşülür. Kural istisnası (VT API) `docs/landing-portfolio.md`'de belgelendi.

- **refactor(web): ana sayfa landing'i sadeleştirildi — yalnızca hero + blog sergisi.**
  - Kaldırılan bölümler: `about-section.tsx`, `projects-section.tsx`, `contact-section.tsx`.
  - `containers/landing-page.tsx`: artık sadece `LandingNav` + `HeroSection` + `BlogSection`.
  - `landing-nav.tsx`: bölüm linkleri ve iletişim CTA'sı kaldırıldı; sade isim + "Tüm yazılar" (`/blog`) linki.
  - `hero-section.tsx`: CTA'lar blog'a yönlendirildi ("Yazıları oku" → `#blog`, "Tüm yazılar" → `/blog`).
  - `data.ts`: yalnızca `profile` kaldı (skills/stats/projects/socials/navLinks kaldırıldı).
  - `motion-primitives.tsx`: kullanılmayan `Parallax` ve `FloatIn` çıkarıldı (`Reveal` + `ScrollProgress` kaldı).
  - Doküman: `docs/landing-portfolio.md` güncellendi.

## 2026-06-21

- **feat(web): ana sayfa portföy landing'ine dönüştürüldü (Motion + parallax + smooth scroll).**
  - `apps/web/src/features/portfolio/` eklendi: `data.ts` (statik içerik), `containers/landing-page.tsx` ve bölüm bileşenleri (hero, about, projects, blog, contact) + `landing-nav.tsx`.
  - `components/motion-primitives.tsx`: yeniden kullanılabilir `Reveal` (whileInView), `Parallax` (`useScroll`+`useTransform`+`useSpring`), `ScrollProgress` ve `FloatIn`. Easing `[0.22,1,0.36,1]`; `useReducedMotion` ile erişilebilir.
  - `apps/web/src/app/page.tsx`: artık portföy landing'i render eder; Strapi'den en yeni 3 yazıyı çekip blog bölümüne `BlogPreview[]` olarak iletir. Tam blog listesi `/blog`'da kalır.
  - `apps/web/src/app/globals.css`: ankor gezinmesi için `scroll-behavior: smooth` + `scroll-padding-top` (yapışkan menü payı), `prefers-reduced-motion` istisnası.
  - Doküman: `docs/landing-portfolio.md`.

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
