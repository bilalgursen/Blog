# Landing / Blog Ana Sayfası (Template)

Ana sayfa (`/`) **tek iç içe akıştır**: site sahibinin tanıtımı (hero) ile blog yazıları ayrı bölümler değil, aynı kompozisyonda örülür. En yeni yazı "öne çıkan" olarak tanıtım metninin yanında durur; kalan yazılar hemen altında akar. Üst menü (header) yoktur.

Sayfada **animasyon yoktur**: giriş efektleri, parallax, smooth scroll ve sayfa geçişi (View Transition) kaldırılmıştır; içerik doğrudan son halinde basılır ve gezinme düz Next `Link` ile yapılır.

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
├── containers/
│   └── landing-page.tsx         # Server: HomeShowcase'i sarar
└── components/
    └── home-showcase.tsx        # Tek iç içe akış: hero + öne çıkan + yazı ızgarası

apps/cms/src/api/profile/        # Strapi single-type: profile (name, role, ...)
apps/web/src/lib/strapi.ts       # getProfile() + Profile + DEFAULT_PROFILE
```

- `app/page.tsx` (Server Component) Strapi'den **tüm** yazıları çeker, istemciye
  taşınabilir sade bir `BlogPreview[]` şekline dönüştürür ve `LandingPage`'e geçirir.
- `home-showcase.tsx` artık animasyon içermediğinden server component'tir; gezinme
  düz Next `Link` ile yapılır.

## Animasyon

Bu sayfada animasyon **yoktur**. Önceki Motion girişleri, parallax, smooth scroll ve
kapak görseli View Transition morph'u tamamen kaldırılmıştır (bkz. `changelog.md`).

## İçeriği düzenleme

- **Profil (ad/rol/tanıtım):** Strapi admin → **Content Manager → Profile**.
- **Yazılar:** Strapi admin → **Content Manager → Article**.
- Şablon varsayılanları kod tarafında: `apps/web/src/lib/strapi.ts` → `DEFAULT_PROFILE`
  ve `apps/cms/src/index.ts` → `seedDefaultProfile`.
