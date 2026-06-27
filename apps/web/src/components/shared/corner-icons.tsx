"use client"

import { CSSProperties, Fragment, useState } from "react"
import { motion } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

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
 * - Hover edilen köşe: gerçek `CustomCursor`, `data-cursor` alanını yuvarlak
 *   sarar ve o ikonu negatifle gösterir.
 * - Diğer köşe: o ikon **sadece kendi negatif şekliyle** belirir (SVG'ye
 *   maskelenmiş beyaz + `mix-blend-difference`; daire yok), paylaşılan `active`.
 *
 * Not: İkonlar doğrudan üst katmanda (CustomCursor ile aynı bağlamda) render
 * edilir; `fixed`/`transform`'lu bir sarmalayıcıya konmaz — aksi halde
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
        // Diğer köşe hover edilince bu köşedeki ikon kendi negatif şekliyle belirir
        // (hover edilen köşeyi zaten gerçek cursor yuvarlak sarıyor).
        const showNeg = active !== null && active !== side

        return (
          <Fragment key={side}>
            {/* Görünmez tetik alanı: gerçek cursor bunu yuvarlak sarar. */}
            <div
              data-cursor
              className="fixed top-4 z-[60] rounded-full"
              style={{ width: ICON, height: ICON, ...edge }}
              onPointerEnter={() => setActive(side)}
              onPointerLeave={() => setActive(null)}
            />

            {/* SVG ikon: arka plan rengiyle boyanır → yalnızca gerçek cursor'ın
                negatif (yuvarlak) alanında görünür. */}
            <span
              role="img"
              aria-label={label}
              className="pointer-events-none fixed top-4 z-[10000] block bg-background"
              style={{ width: ICON, height: ICON, ...edge, ...maskStyle(src) }}
            />

            {/* Diğer köşe için: ikonun yalnızca negatif şekli (daire yok),
                çok hafif fade ile gelir. */}
            <motion.span
              aria-hidden
              className="pointer-events-none fixed top-4 z-[10001] block bg-white mix-blend-difference"
              style={{ width: ICON, height: ICON, ...edge, ...maskStyle(src) }}
              initial={false}
              animate={{ opacity: showNeg ? 1 : 0 }}
              transition={{ duration: 0.18, ease: EASE }}
            />
          </Fragment>
        )
      })}
    </>
  )
}
