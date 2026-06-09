import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Monorepo kökündeki .env dosyasını yükle.
config({ path: "../../.env" })

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.POSTGRES_HOST!,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    ssl: process.env.POSTGRES_SSL === "true",
  },
  // Sadece `app` şemasını yönet; Strapi'nin `public` tablolarına dokunma.
  schemaFilter: ["app"],
  verbose: true,
  strict: true,
})
