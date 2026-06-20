---
description: Klasör hiyerarşisi ve mimari kuralları
alwaysApply: true
---

# Klasör hiyerarşisi ve mimari

## Kısa teknik özet

- **Monorepo (pnpm workspace).** Üst seviye yapı için `monorepo-structure.mdc` kuralına bak.
- Next.js 16 + TypeScript frontend uygulaması **`apps/web/`** altındadır.
- Aşağıdaki `src/` hiyerarşisi **`apps/web/src/`** içindir; domain bazlı yapı `apps/web/src/features/*`.
- Veritabanı (Drizzle) şema ve migration'ları paylaşılan **`packages/db/`** paketindedir (`@repo/db`).
- İçerik yönetimi (CMS) **`apps/cms/`** altındaki Strapi uygulamasındadır.

## Üst seviye hiyerarşi

```text
src/
  app/         -> Rota, sayfa, layout ve API rota girişleri
  features/    -> Domain/özellik bazlı iş mantığı ve UI parçaları
  components/  -> Özellikten bağımsız paylaşılan UI bileşenleri
  lib/         -> Ortak servis/helper (auth, redis, minio, utils)
  types/       -> genel tipler ve paylaşılan sözleşmeler
  constants/   -> uygulama geneli sabitler
  config/      -> merkezi yapılandırma katmanı
  db/          -> Şema ve DB erişim katmanı
  hooks/       -> Paylaşılan özel hook'lar
  styles/      -> Genel stiller
  assets/      -> Statik varlıklar
```

## Özellik bazlı kullanım

- Yeni bir iş alanı eklerken `src/features/<ozellik-adi>/` altında aç.
- Özellik içinde şu düzeni koru:
  - `components/`: Sadece o özellikte kullanılan UI parçaları
  - `containers/`: Sayfa/akış kompozisyonu
  - `actions.ts`: Sunucu işlemleri / iş akışı adımları
  - `validations.ts`: Zod vb. doğrulama şemaları
  - `tables.ts`, `types.ts`: Özelliğe özel veri sözleşmeleri
- Rota tarafında `src/app/*` dosyaları, ilgili `src/features/*` container veya action dosyalarını çağırmalı.

## Uygulama geneli ekleme kuralları

- Uygulama geneli UI primitive: `src/components/ui/*`
- Uygulama genelinde kullanılan bileşen: `src/components/*`
- Uygulama genelinde yardımcı/servis: `src/lib/*`
- Uygulama genelinde tipler: `src/types/*`
- Uygulama genelinde sabitler: `src/constants/*`
- Uygulama genelinde yapılandırma: `src/config/*`
- Uygulama genelinde hook: `src/hooks/*`
- Uygulama genelinde stil: `src/styles/globals.css`
- Yeni route/page/layout: `src/app/*`
- API uç noktası: `src/app/api/*`
- DB şema/değişiklikleri: `src/db/*` + `drizzle/*`

## Mevcut UI bileşenleri (src/components/ui)

Tekrarlı envanter tutmamak için UI bileşen listesi tek kaynakta tutulur:

- `standards/design-system.md` -> `Mevcut UI envanteri (src/components/ui)` bölümü

## Hızlı karar kuralı

- Kod sadece tek bir özelliğe hizmet ediyorsa: `src/features/<ozellik-adi>`
- Birden fazla özellik tarafından kullanılacaksa: uygulama geneli klasörlere taşı (`components`, `lib`, `hooks`)
- Paylaşılan tip/sözleşme ise: `src/types` (klasör yoksa oluştur)
- Uygulama genelinde sabit/yapılandırma ise: `src/constants` veya `src/config` (gerekirse oluştur)
