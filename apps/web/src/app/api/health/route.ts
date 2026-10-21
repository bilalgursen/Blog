/**
 * Sağlık kontrolü (liveness). Docker HEALTHCHECK, `./blog` CLI'ı ve
 * uptime izleyicileri bu ucu kullanır. Bilerek CMS'e bağımlı değildir:
 * Strapi kapalıyken de web ayakta kalır ve boş içerikle sayfa sunar.
 */
export const dynamic = "force-dynamic"

export function GET() {
  return Response.json({ status: "ok" })
}
