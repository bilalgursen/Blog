import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Üretim Docker imajı için kendi kendine yeten çıktı (server.js + minimal node_modules).
  output: "standalone",
  // Monorepo: izleme kökünü repo köküne al ki workspace bağımlılıkları (@repo/db) dahil edilsin.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  transpilePackages: ["@repo/db"],
  // Strapi medyası app/uploads/[...path]/route.ts proxy'si üzerinden aynı
  // origin'den sunulur; remote upload provider'a (S3 vb.) geçilirse
  // images.remotePatterns yeniden eklenmeli.
}

export default nextConfig
