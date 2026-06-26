# Landing / Blog Ana Sayfası (Template)

Ana sayfa (`/`) **tek iç içe akıştır**: site sahibinin tanıtımı (hero) ile blog yazıları ayrı bölümler değil, aynı kompozisyonda örülür. En yeni yazı "öne çıkan" olarak tanıtım metninin yanında durur; kalan yazılar hemen altında akar. Üst menü (header) yoktur; yalnızca ince bir scroll ilerleme çubuğu bulunur.

Tüm giriş animasyonları **Motion** (`motion/react`) ile yapılır, hero'da **parallax** katmanları vardır, sayfa içi gezinme **smooth scroll** ile çalışır. Yazı detayına geçişte kapak görseli **View Transitions API** ile morph olur (paylaşılan eleman geçişi).

Ayrı bir "tüm yazılar" liste sayfası **yoktur** — yayınlanmış tüm yazılar doğrudan ana sayfada listelenir. (`/blog` route'u kaldırıldı; yalnızca `/blog/[slug]` detay sayfası kalır.)

## Şablon (template) davranışı

Bu proje klonlanıp çalıştırıldığında bir **blog sitesi template'i** gibi çalışır:

- Site sahibinin adı/metni kodda sabit değildir; **Strapi `profile` single-type'ından** gelir
  (`name`, `role`, `tagline`, `intro`, `location`, `available`).
- CMS ilk açılışında bootstrap, **varsayılan bir profil kaydı seed'ler** ve public okuma
  iznini verir (`apps/cms/src/index.ts`). Yani klon ilk çalıştırmada da hero dolu gelir.
- Kullanıcı yalnızca **Strapi admin → Content Manager → Profile**'dan kendi adını/metnini girer.
- CMS erişilemezse web, `lib/strapi.ts` içindeki `DEFAULT_PROFILE` şablon varsayılanına düşer.

## Dosya yapısı

```text
apps/web/src/features/portfolio/
├── view-transition.ts           # coverVtName() — paylaşılan kapak için VT adı
├── containers/
│   └── landing-page.tsx         # Server: ScrollProgress + HomeShowcase
└── components/
    ├── motion-primitives.tsx    # Reveal / ScrollProgress
    ├── transition-link.tsx      # startViewTransition ile saran Link
    └── home-showcase.tsx        # Tek iç içe akış: hero + öne çıkan + yazı ızgarası

apps/cms/src/api/profile/        # Strapi single-type: profile (name, role, ...)
apps/web/src/lib/strapi.ts       # getProfile() + Profile + DEFAULT_PROFILE
```

- `app/page.tsx` (Server Component) Strapi'den **tüm** yazıları çeker, istemciye
  taşınabilir sade bir `BlogPreview[]` şekline dönüştürür ve `LandingPage`'e geçirir.
- Animasyonlu bölümler `"use client"`'tır; server sayfası yalnızca veriyi sağlar.

## Animasyon kuralları (CLAUDE.md ile uyumlu)

- **Giriş animasyonları:** Yalnızca `motion/react`. Easing `[0.22, 1, 0.36, 1]`,
  süreler `0.3–0.6s`.
- **Smooth scroll:** Ankor bağlantıları için `globals.css` içinde
  `scroll-behavior: smooth` + `scroll-padding-top: 2rem`.
- **Parallax:** Hero'da `useScroll` + `useTransform`; scroll çubuğu `useSpring` ile
  yumuşatılır (`ScrollProgress`).
- **Scroll-tetikli giriş:** `whileInView` + `viewport={{ once: true }}` (`Reveal`).
- **Sayfa geçişi (showcase → detay):** **View Transitions API**. `TransitionLink`
  navigasyonu `document.startViewTransition` içine alır; aynı `view-transition-name`'i
  (`coverVtName(slug)`) taşıyan kapak görseli kart ↔ detay arasında morph olur.
  Geçiş süresi/easing'i `globals.css` `::view-transition-*` kurallarıyla proje
  standardına çekilir.
  - **Not (kural istisnası):** CLAUDE.md tam sayfa geçişinde `layoutId`/salt-CSS
    yerine giriş animasyonu önerir; ancak proje sahibi bu paylaşılan eleman morph'unu
    açıkça **View Transitions API** ile istedi. Motion hâlâ tüm giriş animasyonlarının
    birincil sistemidir; VT yalnızca kapak görselinin sayfalar arası morph'u içindir.
- **Erişilebilirlik:** `useReducedMotion` + `prefers-reduced-motion` ile parallax,
  smooth scroll ve View Transition animasyonları kapatılır (içerik anında/solarak gelir).
- **Zarif düşüş:** `startViewTransition` desteklenmeyen tarayıcıda `TransitionLink`
  normal Next `Link` navigasyonuna döner.

## İçeriği düzenleme

- **Profil (ad/rol/tanıtım):** Strapi admin → **Content Manager → Profile**.
- **Yazılar:** Strapi admin → **Content Manager → Article** (kapak görseli morph için önemlidir).
- Şablon varsayılanları kod tarafında: `apps/web/src/lib/strapi.ts` → `DEFAULT_PROFILE`
  ve `apps/cms/src/index.ts` → `seedDefaultProfile`.
