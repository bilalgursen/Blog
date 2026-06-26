"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

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
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
