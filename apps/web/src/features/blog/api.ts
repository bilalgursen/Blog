import { strapiFetch } from "@/src/lib/strapi"
import type { Article, StrapiCollection } from "./types"

const ARTICLE_FIELDS =
  "fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedAt&fields[4]=updatedAt"

/** Yayınlanmış yazıları en yeniden eskiye getirir (liste görünümü). */
export async function getArticles(): Promise<Article[]> {
  const res = await strapiFetch<StrapiCollection<Article>>(
    `/articles?${ARTICLE_FIELDS}&populate=cover&sort=publishedAt:desc`,
    { tags: ["articles"] },
  )
  return res.data
}

/** Slug'a göre tek yazı (içerik bloklarıyla birlikte). Yoksa null. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await strapiFetch<StrapiCollection<Article>>(
    `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=cover`,
    { tags: ["articles", `article:${slug}`] },
  )
  return res.data[0] ?? null
}

/** generateStaticParams için tüm slug'lar. */
export async function getAllSlugs(): Promise<string[]> {
  const res = await strapiFetch<StrapiCollection<Pick<Article, "slug">>>(
    `/articles?fields[0]=slug`,
    { tags: ["articles"] },
  )
  return res.data.map((a) => a.slug)
}
