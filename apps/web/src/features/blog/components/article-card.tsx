import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { Card, CardContent } from "@/src/components/ui/card"
import { strapiMedia } from "@/src/lib/strapi"
import type { Article } from "../types"

export function ArticleCard({ article }: { article: Article }) {
  const cover = strapiMedia(article.cover?.formats?.medium?.url ?? article.cover?.url)

  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={article.cover?.alternativeText ?? article.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <CardContent>
          <time className="text-xs text-muted-foreground">
            {format(new Date(article.publishedAt), "d MMMM yyyy", { locale: tr })}
          </time>
          <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:underline">
            {article.title}
          </h2>
          {article.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
