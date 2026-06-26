# Özel Cursor (imleç takibi + öğe morph)

İmleci yumuşakça takip eden ve tıklanabilir bir öğenin üzerine gelindiğinde **o öğenin şeklini alan** (konum + boyut + köşe yarıçapı) özel cursor. Referans davranış: yunuses.com.

## Dosyalar

- `apps/web/src/components/shared/custom-cursor.tsx` — bileşen (client).
- `apps/web/src/app/globals.css` — native imleci gizleyen `html.has-custom-cursor` kuralı.
- `apps/web/src/app/layout.tsx` — `<CustomCursor />` global mount.

## Davranış

- **Boş alan:** ~12px dolu beyaz nokta, fareyi/trackpad'i Motion `useSpring` ile yumuşatarak takip eder. İmlecin anlık hızı (`useVelocity`) ölçülüp yumuşatılarak `scale`'e map edilir; **hızlandıkça (ivmeyle) yuvarlak büyür**, yavaşlayınca eski boyutuna döner (`MAX_SPEED`, `MAX_GROWTH` sabitleriyle ayarlanır).
- **Tıklanabilir öğe üzerinde:** nokta, öğenin `getBoundingClientRect()` ölçülerine ve okunan köşe yarıçapına morph olur; **dolu beyaz kutu öğenin üzerine biner ve `mix-blend-difference` ile içeriği negatife çevirerek kaplar**. Bu modda hız tabanlı büyüme devre dışıdır (`dotMode → 0`) ki kutu öğeyi tam kaplasın. Hedef öğeler:
  `a, button, [role="button"], [data-cursor], input, textarea, select, label, summary`.
  Herhangi bir öğeyi etkileşimli saymak için ona `data-cursor` ekleyin.
- **Görünürlük:** `mix-blend-difference` sayesinde hem açık hem koyu zeminde okunur.
- **Reflow:** scroll/resize sırasında sarılan öğenin konumu güncel tutulur.

## Kapsam / erişilebilirlik

- Yalnızca `pointer: fine` (fare/trackpad) cihazlarda render edilir.
- Dokunmatik cihazlarda ve `prefers-reduced-motion: reduce` tercihinde **hiç çalışmaz** (native imleç de gizlenmez).

## Standartlar

- Animasyon yalnızca **Motion** (`motion/react`) ile (`useMotionValue`, `useSpring`).
- Easing: `[0.22, 1, 0.36, 1]`; spring tabanlı takip + morph.
