import Image from "next/image"
import type { Metadata } from "next"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { CardLink } from "@/src/components/motion"
import { getArticles, mediaUrl } from "@/src/lib/strapi"

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest articles",
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-heading text-5xl font-medium">Blog</h1>
        <p className="mt-3 text-muted-foreground">
          Son yazılar ve düşünceler.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">
          Henüz yayınlanmış bir yazı yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => {
            const cover = mediaUrl(article.cover?.url)
            return (
              <CardLink
                key={article.id}
                index={index}
                href={`/blog/${article.slug}`}
              >
                <Card className="h-full transition-shadow hover:ring-foreground/20">
                  {cover && (
                    <Image
                      src={cover}
                      alt={article.cover?.alternativeText ?? article.title}
                      width={article.cover?.width ?? 600}
                      height={article.cover?.height ?? 400}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg leading-snug">
                      {article.title}
                    </CardTitle>
                    {article.excerpt && (
                      <CardDescription className="line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                    )}
                    {formatDate(article.publishedAt) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(article.publishedAt)}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              </CardLink>
            )
          })}
        </div>
      )}
    </main>
  )
}
