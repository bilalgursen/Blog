# Köşe İkonları (Corner Icons)

Sayfanın üst köşelerinde duran, hover'da **negatif şekilleriyle** beliren iki SVG ikon.

## Davranış

- **Konum:** Üst köşeler, `position: fixed` (`top-4`). Sağ üst = `allah`, sol üst = `muhammed`.
- **Boyut:** Her ikisi de aynı — `56px` kare (`ICON`).
- **Görünürlük:** İkonlar CSS `mask` + **`bg-background`** (sayfa arka plan rengi) ile boyandığından **normalde görünmezdir**. Yalnızca üzerlerinden bir **negatif alan** (beyaz + `mix-blend-difference`) geçince, tersine çevrilen zemin üzerinde kontrast kazanıp belirirler.
- **Hover edilen köşe:** O köşedeki ikon **kendi negatif şekliyle** belirir (daire yok), **animasyonsuz** (anında): SVG'ye maskelenmiş beyaz + `mix-blend-difference` öğe (`showNeg = active === side` ile `opacity` 0↔1, geçiş yok).
- **Durum:** `active` (`"left" | "right" | null`) `CornerIcons` içinde tutulur; görünmez hover tetik alanının `onPointerEnter/Leave`'i ile güncellenir.

## Katman (önemli)

- `bg-background` ikon `z-[10000]`; negatif şekil ikonu `z-[10001]` (üstte).
- Negatif şekil ikonu, `bg-background` ikonun **üstünde** durmalı; altında kalsaydı `bg-background` ikon onu kapatıp iptal ederdi (ikisi aynı şekil/boyut).
- İkonlar doğrudan üst katmanda render edilir; `fixed`/`transform`'lu bir sarmalayıcıya konursa `mix-blend-difference` sayfa zeminiyle harmanlanamaz ve efekt bozulur. Bu yüzden `Fragment` ile düz render edilir.

## Dosyalar

- `apps/web/public/icons/allah.svg` — sağ üst.
- `apps/web/public/icons/muhammed.svg` — sol üst.
- `apps/web/src/components/shared/corner-icons.tsx` — bileşen.
- `apps/web/src/app/layout.tsx` — kök layout'a eklenir.

## Yeni ikon eklemek / değiştirmek

1. SVG'yi `apps/web/public/icons/` altına koy.
2. `corner-icons.tsx` içinde `META` (`src`/`label`) değerlerini güncelle.
