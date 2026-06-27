"use client"

import Image from "next/image"
import { MapPin } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import type { Profile } from "@/src/lib/strapi"
import { cn } from "@/src/lib/utils"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { useEntryMotion } from "@/src/components/motion"
import { DURATION, SMOOTH_OUT } from "@/src/lib/motion-tokens"
import { coverVtName } from "../view-transition"
import { TransitionLink } from "./transition-link"

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
      className={`relative overflow-hidden rounded-2xl bg-muted ${className ?? ""}`}
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
 * Tek yazı kartı. İçerik üç **sabit alana** bölünür: başlık → açıklama →
 * tarih. Tarih her zaman kartın **en altında** durur (açıklama esner), böylece
 * içerik uzunluğu farklı olsa da ızgaradaki kartlar hizalı kalır.
 *
 * Kapağı olmayan yazılar **boş bir görsel kutusu olmadan**, kapaksız şekilde
 * sergilenir (yalnızca metin + üst boşluk).
 */
function PostCard({
  post,
  sizes,
  featured = false,
}: {
  post: BlogPreview
  sizes: string
  featured?: boolean
}) {
  const date = formatDate(post.date)
  const hasCover = Boolean(post.cover)

  return (
    <Card className={cn("h-full overflow-hidden", hasCover && "pt-0")}>
      {hasCover && (
        <div className="p-2">
          <Cover
            post={post}
            sizes={sizes}
            className={cn("w-full", featured ? "aspect-[16/10]" : "aspect-video")}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 px-(--card-spacing)">
        {featured && (
          <Badge variant="secondary" className="w-fit">
            Öne çıkan
          </Badge>
        )}

        {/* Başlık — uzun başlık alt satıra sarar (kırpılmaz). */}
        <h3
          className={cn(
            "font-heading leading-snug font-medium break-words group-hover:underline",
            featured ? "text-xl" : "text-lg"
          )}
        >
          {post.title}
        </h3>

        {/* Açıklama — uzun açıklama alt satıra sarar (kırpılmaz). */}
        <p className="text-sm break-words text-muted-foreground">{post.excerpt}</p>

        {/* Tarih — her zaman en altta */}
        <time className="mt-auto block h-4 text-xs text-muted-foreground">
          {date}
        </time>
      </div>
    </Card>
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
  const animateEntry = useEntryMotion()
  const [featured, ...rest] = posts

  // İlk (soğuk) yüklemede `initial: false` → animasyon yok, içerik son halinde
  // belirir. Sonraki gezinmelerde yumuşak giriş efekti çalışır.
  const fade = !animateEntry
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : reduceMotion
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
            transition={{ duration: DURATION.verySlow, ease: SMOOTH_OUT }}
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
              transition={{ duration: DURATION.verySlow, delay: 0.1, ease: SMOOTH_OUT }}
            >
              <TransitionLink
                href={`/blog/${featured.slug}`}
                className="group block"
              >
                <PostCard
                  post={featured}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  featured
                />
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
                  <PostCard
                    post={post}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
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
