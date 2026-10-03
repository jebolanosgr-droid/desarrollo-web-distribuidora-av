import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL

export const pool = new Pool({
  connectionString: databaseUrl,
  ...(databaseUrl?.includes('sslmode=') && !databaseUrl.includes('sslmode=verify-full')
    ? { connectionString: databaseUrl.replace(/sslmode=(prefer|require|verify-ca)/, 'sslmode=verify-full') }
    : {}),
})
export const db = drizzle(pool, { schema })
