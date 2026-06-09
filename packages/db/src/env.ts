function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Eksik ortam değişkeni: ${name}`)
  }
  return value
}

const host = required("POSTGRES_HOST", process.env.POSTGRES_HOST)
const port = process.env.POSTGRES_PORT ?? "5432"
const database = required("POSTGRES_DB", process.env.POSTGRES_DB)
const user = required("POSTGRES_USER", process.env.POSTGRES_USER)
const password = required("POSTGRES_PASSWORD", process.env.POSTGRES_PASSWORD)
const ssl = process.env.POSTGRES_SSL === "true"

export const databaseUrl = `postgres://${user}:${encodeURIComponent(
  password
)}@${host}:${port}/${database}${ssl ? "?sslmode=require" : ""}`

export const dbConfig = { host, port, database, user, password, ssl }
