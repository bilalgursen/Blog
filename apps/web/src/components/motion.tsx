"use client"

import { motion } from "motion/react"
import { useEffect, useState, type ReactNode } from "react"

import { DURATION, SMOOTH_OUT } from "@/src/lib/motion-tokens"

/**
 * Sayfa **ilk (soğuk) yüklemede** açılış. İlk render'da giriş animasyonu
 * çalışmaz; içerik doğrudan son halinde belirir. Sonraki mount'larda
 * (client-side gezinme) animasyon yeniden devreye girer.
 */
let hasLoadedOnce = false

/**
 * Bu mount'ta giriş animasyonunun çalışıp çalışmayacağını döndürür.
 * İlk sayfa yüklemesinde `false`, sonraki gezinmelerde `true`.
 */
export function useEntryMotion() {
  const [shouldAnimate] = useState(() => hasLoadedOnce)

  useEffect(() => {
    hasLoadedOnce = true
  }, [])

  return shouldAnimate
}

/** İçeriği hafifçe yukarı kaydırıp belirginleştirerek sahneye sokar. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const animate = useEntryMotion()

  return (
    <motion.div
      className={className}
      initial={animate ? { opacity: 0, y } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.verySlow, delay, ease: SMOOTH_OUT }}
    >
      {children}
    </motion.div>
  )
}
