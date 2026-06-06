import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { databaseUrl } from "./env"
import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var __postgresClient: ReturnType<typeof postgres> | undefined
}

// Geliştirme sırasında hot-reload'da bağlantı havuzunun çoğalmasını önle.
const client =
  globalThis.__postgresClient ?? postgres(databaseUrl, { max: 10 })

if (process.env.NODE_ENV !== "production") {
  globalThis.__postgresClient = client
}

export const db = drizzle(client, { schema })

export * from "./schema"
export { schema }
