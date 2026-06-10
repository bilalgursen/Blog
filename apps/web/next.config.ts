import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db"],
  output: "standalone",
}

export default nextConfig
