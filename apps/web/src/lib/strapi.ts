import type { BlocksContent } from "@/src/components/blocks-renderer"

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"

/** Strapi media (Single media) shape, flattened as in Strapi 5. */
export interface StrapiMedia {
  id: number
  documentId: string
  url: string
  alternativeText: string | null
  width: number | null
  height: number | null
  formats?: Record<
    string,
    { url: string; width: number; height: number }
  > | null
}

/** Matches the Article collection: title, slug, excerpt, cover, content. */
export interface Article {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt: string | null
  cover: StrapiMedia | null
  content: BlocksContent
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

/** Prefixes relative Strapi media URLs with the Strapi host. */
export function mediaUrl(url: string | undefined | null): string | null {
  if (!url) return null
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`
}

async function strapiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    // Revalidate periodically so published changes show up without a redeploy.
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText} (${path})`
    )
  }

  return res.json() as Promise<T>
}

/** All published articles, newest first, with cover populated. */
export async function getArticles(): Promise<Article[]> {
  const params = new URLSearchParams({
    "populate[0]": "cover",
    "sort[0]": "publishedAt:desc",
    "pagination[pageSize]": "100",
  })
  const json = await strapiFetch<StrapiListResponse<Article>>(
    `/articles?${params.toString()}`
  )
  return json.data
}

/** A single published article by its slug, or null if not found. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const params = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[0]": "cover",
    "pagination[pageSize]": "1",
  })
  const json = await strapiFetch<StrapiListResponse<Article>>(
    `/articles?${params.toString()}`
  )
  return json.data[0] ?? null
}
