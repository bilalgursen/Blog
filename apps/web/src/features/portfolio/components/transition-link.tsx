"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps, MouseEvent } from "react"

/**
 * Next `Link` davranışını korur ama navigasyonu `document.startViewTransition`
 * içine alır → paylaşılan `view-transition-name`'li elemanlar (kapak görseli)
 * sayfa geçişinde morph olur. API desteklenmiyorsa normal navigasyona düşer.
 */
export function TransitionLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const router = useRouter()

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
        startViewTransition?: (cb: () => void) => void
      }).startViewTransition

    if (!startViewTransition) return // fallback: normal Link navigasyonu

    event.preventDefault()
    const url = typeof href === "string" ? href : href.toString()
    startViewTransition.call(document, () => router.push(url))
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
