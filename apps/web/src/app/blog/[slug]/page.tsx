import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { BlocksRenderer } from "@/src/components/blocks-renderer"
import { FadeIn } from "@/src/components/motion"
import { TransitionLink } from "@/src/features/portfolio/components/transition-link"
import { coverVtName } from "@/src/features/portfolio/view-transition"
import { getArticleBySlug, getArticles, mediaUrl } from "@/src/lib/strapi"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: "Yazı bulunamadı" }
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  }
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) notFound()

  const cover = mediaUrl(article.cover?.url)
  const date = formatDate(article.publishedAt)

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <TransitionLink
        href="/"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Geri
      </TransitionLink>

      <article className="mt-8 break-words">
        {/* Kapak: View Transition ile showcase kartından morph olur — bu yüzden
            Motion giriş animasyonuna sarılmaz (ikisi çakışmasın). */}
        {cover && (
          <div
            className="mb-10 overflow-hidden rounded-2xl"
            style={{ viewTransitionName: coverVtName(slug) } as React.CSSProperties}
          >
            <Image
              src={cover}
              alt={article.cover?.alternativeText ?? article.title}
              width={article.cover?.width ?? 1200}
              height={article.cover?.height ?? 675}
              className="aspect-video w-full object-cover"
              priority
            />
          </div>
        )}

        <FadeIn>
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-medium sm:text-5xl">
              {article.title}
            </h1>
            {date && (
              <p className="mt-3 text-sm text-muted-foreground">{date}</p>
            )}
            {article.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {article.excerpt}
              </p>
            )}
          </header>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="text-base">
            <BlocksRenderer content={article.content} />
          </div>
        </FadeIn>
      </article>
    </main>
  )
}
