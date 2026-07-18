import type { NextRequest } from "next/server"

/**
 * Strapi medya proxy'si — /uploads/* istekleri Strapi'nin upload klasörüne
 * yönlendirilir. Böylece medya, web uygulamasının kendi origin'inden sunulur:
 * next/image optimizer'ı container içinden `localhost:1337`'ye çıkmak zorunda
 * kalmaz ve `NEXT_PUBLIC_STRAPI_URL`'in build anında gömülmesi gerekmez.
 * Native dev, Docker dev ve prod'da aynı şekilde çalışır.
 */

// Runtime'da okunur (build'e gömülmez): Docker'da cms servisi, yerelde localhost.
const STRAPI_ORIGIN =
  process.env.STRAPI_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  "http://localhost:1337"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const target = `${STRAPI_ORIGIN}/uploads/${path
    .map(encodeURIComponent)
    .join("/")}`

  let upstream: Response
  try {
    // Binary'leri Next'in fetch cache'ine sokma; tarayıcı/optimizer aşağıdaki
    // Cache-Control başlığı üzerinden cache'ler.
    upstream = await fetch(target, { cache: "no-store" })
  } catch {
    return new Response("CMS erişilemez durumda.", { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(null, {
      status: upstream.status === 404 ? 404 : 502,
    })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  // content-length bilerek geçirilmiyor: undici upstream gzip'i şeffaf açar,
  // eski uzunluk yanlış olur; framing'i runtime hesaplasın.
  // Strapi upload dosya adları content-hash'lidir → immutable cache güvenli.
  headers.set("cache-control", "public, max-age=31536000, immutable")

  return new Response(upstream.body, { status: 200, headers })
}
