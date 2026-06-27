"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import type { ComponentProps, MouseEvent } from "react"

/**
 * Next `Link` davranışını korur ama navigasyonu `document.startViewTransition`
 * içine alır → paylaşılan `view-transition-name`'li elemanlar (kapak görseli)
 * sayfa geçişinde morph olur. API desteklenmiyorsa normal navigasyona düşer.
 *
 * Kritik nokta: App Router'da `router.push` yeni sayfa DOM'a basılmadan **hemen**
 * geri döner. Bu yüzden View Transition'ın "yeni" kare snapshot'ı, henüz gelmemiş
 * içeriği yakalardı (geçiş ölü kalır, sonra içerik ani yerleşir). Geçişi yeni rota
 * gerçekten commit olana (pathname değişip yeni kare boyanana) kadar **bekletiyoruz**;
 * böylece kapak görseli pürüzsüz morph olur.
 */
export function TransitionLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const router = useRouter()
  const pathname = usePathname()

  // Bekleyen geçişi çözecek resolver + güvenlik zaman aşımı.
  const resolveRef = useRef<(() => void) | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function settle() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const resolve = resolveRef.current
    resolveRef.current = null
    resolve?.()
  }

  // Yeni rota commit olduğunda (pathname değişti) bir kare bekleyip geçişi çöz →
  // tarayıcı yeni kareyi doğru anda (içerik boyandıktan sonra) snapshot'lar.
  useEffect(() => {
    if (!resolveRef.current) return
    const id = requestAnimationFrame(settle)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => () => settle(), [])

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)

    // Yeni sekme / modifier / orta tık → tarayıcı varsayılanına bırak.
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return
    }

    const startViewTransition =
      typeof document !== "undefined" &&
      (document as Document & {
        startViewTransition?: (cb: () => Promise<void> | void) => void
      }).startViewTransition

    if (!startViewTransition) return // fallback: normal Link navigasyonu

    const url = typeof href === "string" ? href : href.toString()

    // Aynı sayfaya tık → geçişe gerek yok, varsayılana bırak.
    if (url === pathname) return

    event.preventDefault()

    startViewTransition.call(document, () => {
      // Önceki bekleyen geçiş varsa serbest bırak (üst üste tık güvenliği).
      settle()
      return new Promise<void>((resolve) => {
        resolveRef.current = resolve
        // Navigasyon takılırsa geçiş sonsuza dek asılı kalmasın.
        timeoutRef.current = setTimeout(settle, 1500)
        router.push(url)
      })
    })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
