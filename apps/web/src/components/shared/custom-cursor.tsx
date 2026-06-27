"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

/** Cursor'ın varsayılan (boş alan) modundaki nokta boyutu. */
const DOT_SIZE = 12

/** Hover'da öğeyi sararken kenarlarına eklenen iç boşluk (px). */
const HOVER_PADDING = 6

/** Nokta bu hızda (px/sn) en büyük haline ulaşır. */
const MAX_SPEED = 1600

/** İvmeyle ulaşılan en büyük büyüme oranı (1 = büyüme yok). */
const MAX_GROWTH = 2.2

/** Tıklanabilir öğeleri yakalamak için kullanılan seçici. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor], input:not([type="hidden"]), textarea, select, label, summary'

type Target = {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

/**
 * İmleci takip eden, tıklanabilir öğelerin üzerine gelindiğinde o öğenin
 * şeklini (konum + boyut + köşe yarıçapı) alarak saran özel cursor.
 *
 * - Yalnızca `pointer: fine` (fare/trackpad) cihazlarda çalışır; dokunmatik
 *   cihazlarda ve `prefers-reduced-motion` durumunda hiç render edilmez.
 * - Native imleç, cursor aktifken JS ile gizlenir (bkz. `globals.css`).
 * - Hareket Motion `useSpring` ile yumuşatılır; tüm geçişler tek tutarlı
 *   easing ([0.22, 1, 0.36, 1]) ile akar.
 */
export function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  // Cursor kutusunun sol-üst köşesi ve boyutu (motion values).
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const width = useMotionValue(DOT_SIZE)
  const height = useMotionValue(DOT_SIZE)
  const radius = useMotionValue(DOT_SIZE / 2)

  // Ham imleç konumu (her harekette güncellenir). İvme bundan ölçülür; böylece
  // kutunun öğeye "zıplaması" sahte hız sıçraması yaratmaz.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  // Yumuşatma: boş alanda nokta hızlı takip etsin, morph daha yumuşak otursun.
  const spring = { stiffness: 500, damping: 40, mass: 0.6 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)
  const sw = useSpring(width, { stiffness: 350, damping: 32 })
  const sh = useSpring(height, { stiffness: 350, damping: 32 })
  const sr = useSpring(radius, { stiffness: 350, damping: 32 })

  // İvme: imlecin anlık hızını (px/sn) ölçüp yumuşatılmış bir büyüme oranına
  // çevirir. Yalnızca boş alan (nokta) modunda etkili; öğe sarma modunda
  // `dotMode` 0'a düşerek büyümeyi devre dışı bırakır.
  // `dotModeTarget`: 1 = nokta, 0 = öğe sarma. Spring'lenmiş `dotMode`, boyut
  // (`sw`/`sh`) ile aynı tempoda geçer; böylece ayrılırken kutu noktaya dönene
  // kadar hız-büyümesi devreye girmez (ani balon bug'ı önlenir).
  const dotModeTarget = useMotionValue(1)
  const dotMode = useSpring(dotModeTarget, { stiffness: 350, damping: 32 })
  const vx = useVelocity(px)
  const vy = useVelocity(py)
  const speed = useTransform<number, number>(
    [vx, vy],
    ([dx, dy]) => Math.hypot(dx, dy)
  )
  const smoothSpeed = useSpring(speed, { stiffness: 120, damping: 20, mass: 0.4 })
  const scale = useTransform<number, number>(
    [smoothSpeed, dotMode],
    ([s, mode]) => {
      const t = Math.min(s / MAX_SPEED, 1)
      const grown = 1 + (MAX_GROWTH - 1) * t
      // mode: 1 → büyüme tam uygulanır, 0 → sabit 1 (öğeyi tam kaplasın).
      return 1 + (grown - 1) * mode
    }
  )

  // İmleç pencere içinde mi? (giriş/çıkışta fade için)
  const [visible, setVisible] = useState(false)
  // O an üzerinde olunan öğe; scroll/resize'da konumu güncel tutmak için.
  const activeEl = useRef<Element | null>(null)

  // Fare/trackpad var mı? (SSR güvenli; yalnızca client'ta belirlenir.)
  useEffect(() => {
    if (reduceMotion) return
    const mq = window.matchMedia("(pointer: fine)")
    const apply = () => setEnabled(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [reduceMotion])

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add("has-custom-cursor")

    const setDot = (clientX: number, clientY: number) => {
      width.set(DOT_SIZE)
      height.set(DOT_SIZE)
      radius.set(DOT_SIZE / 2)
      x.set(clientX - DOT_SIZE / 2)
      y.set(clientY - DOT_SIZE / 2)
    }

    // Yakalanan öğe çoğu zaman görsel sarmalayıcıdır (örn. `<a class="block">`)
    // ve kendi köşe yarıçapı 0'dır; asıl yuvarlak görsel onu dolduran çocuktur
    // (örn. `Card` → `rounded-xl`). Bu durumda çerçeve kartı tam sarsın diye
    // alanı kaplayan ilk yuvarlak çocuğa inilir.
    const visualOf = (el: Element): Element => {
      if (parseFloat(getComputedStyle(el).borderTopLeftRadius) > 0) return el
      const rect = el.getBoundingClientRect()
      let node: Element | null = el.firstElementChild
      while (node) {
        const cs = getComputedStyle(node)
        const r = parseFloat(cs.borderTopLeftRadius) || 0
        const nrect = node.getBoundingClientRect()
        // Çocuk, sarmalayıcının neredeyse tamamını dolduruyor ve yuvarlaksa onu seç.
        if (
          r > 0 &&
          nrect.width >= rect.width - 2 &&
          nrect.height >= rect.height - 2
        ) {
          return node
        }
        node = node.firstElementChild
      }
      return el
    }

    const wrap = (el: Element): Target => {
      const visual = visualOf(el)
      const rect = visual.getBoundingClientRect()
      // Görselin kendi köşe yarıçapını okuyup padding kadar büyüterek saran his ver.
      const rawRadius =
        parseFloat(getComputedStyle(visual).borderTopLeftRadius) || 0
      // `rounded-full` devasa bir yarıçap (≈3.3e7px) verir; bundan başka bir
      // öğeye (örn. karta) geçerken `radius` spring'i bu kocaman değerden inerken
      // kutu uzun süre dev bir daire olarak takılır. Görselde yarıçap zaten en
      // fazla kısa kenarın yarısı kadar etkili olduğundan oraya kırpıyoruz.
      const elRadius = Math.min(rawRadius, Math.min(rect.width, rect.height) / 2)
      return {
        x: rect.left - HOVER_PADDING,
        y: rect.top - HOVER_PADDING,
        width: rect.width + HOVER_PADDING * 2,
        height: rect.height + HOVER_PADDING * 2,
        radius: elRadius ? elRadius + HOVER_PADDING : 8,
      }
    }

    const setTarget = (t: Target) => {
      x.set(t.x)
      y.set(t.y)
      width.set(t.width)
      height.set(t.height)
      radius.set(t.radius)
    }

    const onMove = (e: PointerEvent) => {
      setVisible(true)
      // İvme ölçümü için ham konum (mod fark etmeksizin).
      px.set(e.clientX)
      py.set(e.clientY)
      const interactive = (e.target as Element | null)?.closest?.(
        INTERACTIVE_SELECTOR
      )
      if (interactive) {
        activeEl.current = interactive
        dotModeTarget.set(0)
        setTarget(wrap(interactive))
      } else {
        activeEl.current = null
        dotModeTarget.set(1)
        setDot(e.clientX, e.clientY)
      }
    }

    // Scroll/resize sırasında sarılan öğenin konumunu güncel tut.
    const onReflow = () => {
      const el = activeEl.current
      if (!el) return
      // Sayfa geçişinde (View Transition) hedef sayfa en üste scroll olur ve bu
      // listener tetiklenir; ancak tıklanan link artık DOM'dan kalkmıştır. Bağlı
      // olmayan bir öğenin getBoundingClientRect()'i 0,0,0,0 döndürdüğünden kutu
      // sol üste sıçrardı. Öğe kopmuşsa son fare konumunda nokta moduna düş.
      if (!el.isConnected) {
        activeEl.current = null
        dotModeTarget.set(1)
        setDot(px.get(), py.get())
        return
      }
      setTarget(wrap(el))
    }

    const onLeave = () => setVisible(false)

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", onReflow, { passive: true })
    window.addEventListener("resize", onReflow)
    document.addEventListener("pointerleave", onLeave)

    return () => {
      document.documentElement.classList.remove("has-custom-cursor")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onReflow)
      window.removeEventListener("resize", onReflow)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [enabled, x, y, width, height, radius, dotModeTarget, px, py])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
      style={{
        x: sx,
        y: sy,
        width: sw,
        height: sh,
        borderRadius: sr,
        scale,
        // Her zaman dolu beyaz; mix-blend-difference ile altındaki içeriği
        // negatife çevirir. Boş alanda küçük nokta, hover'da öğeyi tamamen kaplar.
        backgroundColor: "rgb(255,255,255)",
      }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    />
  )
}
