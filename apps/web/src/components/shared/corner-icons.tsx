"use client"

import { CSSProperties, Fragment, useState } from "react"

/** Köşe boşluğu (px) — Tailwind `top-4` / `x-4` = 1rem. */
const CORNER = 16
/** İkon kutusunun kenarı (px). İkisi de aynı boyutta. */
const ICON = 56

type Side = "left" | "right"

const META: Record<Side, { src: string; label: string }> = {
  left: { src: "/icons/muhammed.svg", label: "Muhammed" },
  right: { src: "/icons/allah.svg", label: "Allah" },
}

/** SVG'yi `currentColor`/`bg-*` ile boyamak için maske stili. */
function maskStyle(src: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  }
}

/**
 * Üst köşelerdeki iki SVG ikon — sağda `allah`, solda `muhammed`. İkonlar arka
 * plan rengiyle (`bg-background`) boyandığından **normalde görünmezdir**; yalnızca
 * üzerlerinden bir **negatif alan** (beyaz + `mix-blend-difference`) geçtiğinde,
 * tersine çevrilen zemin üzerinde kontrast kazanıp belirirler.
 *
 * - Hover edilen köşe: o ikon **kendi negatif şekliyle** belirir (SVG'ye
 *   maskelenmiş beyaz + `mix-blend-difference`; daire yok), `active` ile sürülür.
 *
 * Not: İkonlar doğrudan üst katmanda render edilir; `fixed`/`transform`'lu bir
 * sarmalayıcıya konmaz — aksi halde
 * `mix-blend-difference` sayfa zeminiyle harmanlanamaz. Negatif şekil ikonu,
 * `bg-background` ikonun **üstünde** (`z-[10001]`) durur ki onu iptal etmesin.
 */
export function CornerIcons() {
  const [active, setActive] = useState<Side | null>(null)

  return (
    <>
      {(["left", "right"] as const).map((side) => {
        const { src, label } = META[side]
        const edge = side === "left" ? { left: CORNER } : { right: CORNER }
        // Hover edilen köşedeki ikon kendi negatif şekliyle belirir.
        const showNeg = active === side

        return (
          <Fragment key={side}>
            {/* Görünmez hover tetik alanı. */}
            <div
              className="fixed top-4 z-[60] rounded-full"
              style={{ width: ICON, height: ICON, ...edge }}
              onPointerEnter={() => setActive(side)}
              onPointerLeave={() => setActive(null)}
            />

            {/* SVG ikon: arka plan rengiyle boyanır → normalde görünmez,
                üstündeki negatif şekil katmanıyla belirir. */}
            <span
              role="img"
              aria-label={label}
              className="pointer-events-none fixed top-4 z-[10000] block bg-background"
              style={{ width: ICON, height: ICON, ...edge, ...maskStyle(src) }}
            />

            {/* Hover'da: ikonun negatif şekli (daire yok) animasyonsuz belirir. */}
            <span
              aria-hidden
              className="pointer-events-none fixed top-4 z-[10001] block bg-white mix-blend-difference"
              style={{
                width: ICON,
                height: ICON,
                ...edge,
                ...maskStyle(src),
                opacity: showNeg ? 1 : 0,
              }}
            />
          </Fragment>
        )
      })}
    </>
  )
}
