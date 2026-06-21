import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

import { ARTICLES_TAG } from "@/src/lib/strapi"

/**
 * Manuel (on-demand) revalidation endpoint.
 *
 * İçerik normalde `revalidate: 3600` ile saatte bir tazelenir. Acil bir
 * düzenlemeyi beklemeden yansıtmak istediğinde bu endpoint elle çağrılır ve
 * `articles` cache tag'ini geçersiz kılar; yazı saniyesinde frontend'e düşer.
 * (Otomatik Strapi webhook'u kaldırıldı — bkz. docs/local-development.md.)
 *
 * Güvenlik: istek `REVALIDATE_SECRET` ile doğrulanır. Secret,
 *   - `Authorization: Bearer <secret>` header'ı, veya
 *   - `?secret=<secret>` query parametresi
 * olarak gönderilebilir (Strapi webhook header desteklemiyorsa query kullan).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: "REVALIDATE_SECRET tanımlı değil." },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined
  const provided = bearer ?? request.nextUrl.searchParams.get("secret")

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Geçersiz secret." },
      { status: 401 }
    )
  }

  revalidateTag(ARTICLES_TAG)

  return NextResponse.json({
    revalidated: true,
    tag: ARTICLES_TAG,
    now: Date.now(),
  })
}
