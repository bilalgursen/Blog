# Köşe İkonları (Corner Icons)

Sayfanın üst köşelerinde duran, özel cursor'ın **negatif alanıyla** beliren iki SVG ikon.

## Davranış

- **Konum:** Üst köşeler, `position: fixed` (`top-4`). Sağ üst = `allah`, sol üst = `muhammed`.
- **Boyut:** Her ikisi de aynı — `56px` kare (`ICON`).
- **Görünürlük:** İkonlar CSS `mask` + **`bg-background`** (sayfa arka plan rengi) ile boyandığından **normalde görünmezdir**. Yalnızca üzerlerinden bir **negatif alan** (beyaz + `mix-blend-difference`) geçince, tersine çevrilen zemin üzerinde kontrast kazanıp belirirler.
- **Hover edilen köşe:** Gerçek `CustomCursor`, `data-cursor` tetik alanını yuvarlak sarar ve o ikonu negatif (yuvarlak) alanda gösterir.
- **Diğer köşe:** O ikon **yalnızca kendi negatif şekliyle** belirir (daire yok), **çok hafif fade** ile (Motion `opacity`, 0.18s): SVG'ye maskelenmiş beyaz + `mix-blend-difference` öğe (`showNeg` ile `opacity` 0↔1).
- **Durum:** Paylaşılan `active` (`"left" | "right" | null`) `CornerIcons` içinde tutulur; `onPointerEnter/Leave` ile güncellenir.

## Katman (önemli)

- `bg-background` ikon `z-[10000]` (gerçek cursor'ın yuvarlak negatifinde reveal olur); negatif şekil ikonu `z-[10001]` (cursor `z-[9999]`'un üstünde).
- Negatif şekil ikonu, `bg-background` ikonun **üstünde** durmalı; altında kalsaydı `bg-background` ikon onu kapatıp iptal ederdi (ikisi aynı şekil/boyut).
- İkonlar doğrudan üst katmanda (CustomCursor ile aynı stacking context) render edilir; `fixed`/`transform`'lu bir sarmalayıcıya konursa `mix-blend-difference` sayfa zeminiyle harmanlanamaz ve efekt bozulur. Bu yüzden `Fragment` ile düz render edilir.

## Dosyalar

- `apps/web/public/icons/allah.svg` — sağ üst.
- `apps/web/public/icons/muhammed.svg` — sol üst.
- `apps/web/src/components/shared/corner-icons.tsx` — bileşen.
- `apps/web/src/components/shared/custom-cursor.tsx` — `[data-cursor]` öğelerini yuvarlak sarar.
- `apps/web/src/app/layout.tsx` — kök layout'a eklenir.

## Yeni ikon eklemek / değiştirmek

1. SVG'yi `apps/web/public/icons/` altına koy.
2. `corner-icons.tsx` içinde `META` (`src`/`label`) değerlerini güncelle.
