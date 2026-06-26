import type { Profile } from "@/src/lib/strapi"
import { HomeShowcase, type BlogPreview } from "../components/home-showcase"

/**
 * Ana sayfanın bileşimi: tek iç içe akış (tanıtım + blog). Sade tasarım;
 * dekoratif scroll çubuğu ve arka plan efektleri yok.
 * Profil ve blog verisi server tarafında çekilip prop olarak iletilir.
 */
export function LandingPage({
  profile,
  posts,
}: {
  profile: Profile
  posts: BlogPreview[]
}) {
  return (
    <main>
      <HomeShowcase profile={profile} posts={posts} />
    </main>
  )
}
