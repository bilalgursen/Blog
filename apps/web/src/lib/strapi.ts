import type { BlocksContent } from "@/src/components/blocks-renderer"

/** Public Strapi base URL — exposed to the browser (media URLs, links). */
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"

/**
 * Server-side base URL used for fetch from Server Components.
 * In Docker the web container reaches Strapi via the `cms` service host,
 * not `localhost`. Falls back to the public URL for local (non-Docker) dev.
 */
const SERVER_STRAPI_URL =
  process.env.STRAPI_INTERNAL_URL ?? STRAPI_URL

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

/** Cache tag for all article fetches — allows manual on-demand revalidation. */
export const ARTICLES_TAG = "articles"

/**
 * Fetches from Strapi, returning `null` instead of throwing when the CMS is
 * unreachable (e.g. running only `pnpm dev:web` without Strapi) or responds
 * with an error. Callers fall back to empty data so pages still render.
 */
async function strapiFetch<T>(path: string): Promise<T | null> {
  let res: Response
  try {
    res = await fetch(`${SERVER_STRAPI_URL}/api${path}`, {
      headers: { "Content-Type": "application/json" },
      // Tagged + time-based revalidation. Stale-while-revalidate: served from
      // cache for 60s, then the first request refreshes it in the background —
      // ~1 Strapi hit per route per minute regardless of traffic. The `articles`
      // tag also allows manual on-demand purges via /api/revalidate.
      next: { revalidate: 60, tags: [ARTICLES_TAG] },
    })
  } catch {
    console.warn(
      `[strapi] CMS'e ulaşılamadı (${SERVER_STRAPI_URL}). İçerik boş döndü. ` +
        `Strapi'yi başlatmak için: pnpm dev:cms`
    )
    return null
  }

  if (!res.ok) {
    console.warn(
      `[strapi] İstek başarısız: ${res.status} ${res.statusText} (${path})`
    )
    return null
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
  return json?.data ?? []
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
  return json?.data[0] ?? null
}
