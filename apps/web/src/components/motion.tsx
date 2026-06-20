"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { ComponentProps, ReactNode } from "react"

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

const MotionLink = motion.create(Link)

/** Liste kartlarını sırayla sahneye sokan + hover'da hafifçe kaldıran link. */
export function CardLink({
  index = 0,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { index?: number }) {
  return (
    <MotionLink
      {...props}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
      whileHover={{ y: -4 }}
    >
      {children}
    </MotionLink>
  )
}
