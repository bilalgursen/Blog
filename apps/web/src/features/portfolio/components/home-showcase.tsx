"use client"

import Image from "next/image"
import { MapPin } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import type { Profile } from "@/src/lib/strapi"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { coverVtName } from "../view-transition"
import { TransitionLink } from "./transition-link"

const EASE = [0.22, 1, 0.36, 1] as const

/** Server tarafında düzleştirilmiş, istemciye güvenle taşınabilen yazı özeti. */
export type BlogPreview = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover: string | null
  coverAlt: string | null
  date: string | null
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Kapak görseli — kart ↔ detay arasında View Transition ile morph olur. */
function Cover({
  post,
  sizes,
  className,
}: {
  post: BlogPreview
  sizes: string
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-muted ${className ?? ""}`}
      style={
        post.cover
          ? ({ viewTransitionName: coverVtName(post.slug) } as React.CSSProperties)
          : undefined
      }
    >
      {post.cover && (
        <Image
          src={post.cover}
          alt={post.coverAlt ?? post.title}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  )
}

/**
 * Ana sayfanın tek, iç içe akışı: site sahibinin tanıtımı (hero) ile blog
 * yazıları ayrı bölümler değil; aynı kompozisyonda örülür. İlk (öne çıkan)
 * yazı hero metninin yanında durur, kalan yazılar hemen altında akar.
 * İsim/metin Strapi `profile` single-type'ından gelir (template).
 *
 * Sade tasarım: dekoratif arka plan ışıkları ve parallax yok; yalnızca
 * sayfa açılışında tek, yumuşak bir giriş efekti kullanılır.
 */
export function HomeShowcase({
  profile,
  posts,
}: {
  profile: Profile
  posts: BlogPreview[]
}) {
  const reduceMotion = useReducedMotion()
  const [featured, ...rest] = posts

  const fade = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  return (
    <section id="top">
      <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        {/* Üst sıra: tanıtım metni + öne çıkan yazı yan yana (iç içe) */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {profile.available && (
              <Badge variant="outline" className="mb-6 gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Yeni projelere açık
              </Badge>
            )}
            {profile.role && (
              <p className="text-sm font-medium tracking-wider text-primary uppercase">
                {profile.role}
              </p>
            )}

            <h1 className="mt-2 font-heading text-5xl leading-[1.05] font-medium tracking-tight sm:text-6xl">
              {profile.name}
            </h1>

            {profile.tagline && (
              <p className="mt-4 text-xl text-muted-foreground">
                {profile.tagline}
              </p>
            )}

            {profile.intro && (
              <p className="mt-5 max-w-md text-muted-foreground">
                {profile.intro}
              </p>
            )}

            {profile.location && (
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {profile.location}
              </span>
            )}
          </motion.div>

          {/* Öne çıkan (en yeni) yazı — hero ile aynı sırada */}
          {featured && (
            <motion.div
              initial={fade.initial}
              animate={fade.animate}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            >
              <TransitionLink
                href={`/blog/${featured.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-lg">
                  <Cover
                    post={featured}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="aspect-[16/10] w-full"
                  />
                  <CardHeader>
                    <Badge variant="secondary" className="mb-1 w-fit">
                      Öne çıkan
                    </Badge>
                    <CardTitle className="text-xl leading-snug group-hover:underline">
                      {featured.title}
                    </CardTitle>
                    {featured.excerpt && (
                      <CardDescription className="line-clamp-2">
                        {featured.excerpt}
                      </CardDescription>
                    )}
                    {formatDate(featured.date) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(featured.date)}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              </TransitionLink>
            </motion.div>
          )}
        </div>

        {/* Kalan yazılar — aynı akışın devamı, ayrı bölüm başlığı yok */}
        {rest.length > 0 && (
          <div id="blog" className="mt-20 scroll-mt-8">
            <p className="text-sm font-medium tracking-wider text-primary uppercase">
              Daha fazla yazı
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <TransitionLink
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-md">
                    <Cover
                      post={post}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="aspect-video w-full"
                    />
                    <CardHeader>
                      <CardTitle className="text-lg leading-snug group-hover:underline">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      )}
                      {formatDate(post.date) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(post.date)}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </TransitionLink>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 && (
          <p className="mt-16 text-muted-foreground">
            Henüz yayınlanmış bir yazı yok. Strapi admin panelinden ilk yazınızı
            ekleyin.
          </p>
        )}
      </div>
    </section>
  )
}
