import { getArticles, getProfile, mediaUrl } from "@/src/lib/strapi"
import { LandingPage } from "@/src/features/portfolio/containers/landing-page"
import type { BlogPreview } from "@/src/features/portfolio/components/home-showcase"

/** Ana sayfa: tanıtım (CMS profili) + blog yazılarının tek iç içe akışı. */
export default async function Page() {
  const [profile, articles] = await Promise.all([getProfile(), getArticles()])

  // Admin'de `featured` işaretli yazıyı başa al (öne çıkan kart). Stable sort:
  // işaretli yoksa mevcut "en yeni başta" sırası korunur (template güvenli).
  const ordered = [...articles].sort(
    (a, b) => Number(b.featured) - Number(a.featured)
  )

  const posts: BlogPreview[] = ordered.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    cover: mediaUrl(article.cover?.formats?.medium?.url ?? article.cover?.url),
    coverAlt: article.cover?.alternativeText ?? null,
    date: article.publishedAt,
  }))

  return <LandingPage profile={profile} posts={posts} />
}
