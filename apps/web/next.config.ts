import type { NextConfig } from "next"

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"
const { protocol, hostname, port } = new URL(strapiUrl)

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db"],
  images: {
    // Strapi geliştirmede localhost'tan görsel sunar; Next 16 özel IP'lerden
    // optimizasyonu varsayılan engellediği için dev'de bu bayrak gerekir.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port: port || undefined,
        pathname: "/uploads/**",
      },
    ],
  },
}

export default nextConfig
