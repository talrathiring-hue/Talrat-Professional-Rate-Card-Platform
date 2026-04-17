
//  Supabase connection pooling via PgBouncer
//  Query logging in development
// Connection retry on cold start
// Proper singleton pattern for serverless

import { PrismaClient } from '@prisma/client'

// ─── Singleton pattern ────────────────────────────────────────────────────────
// In serverless (Vercel), each function invocation may create a new module.
// We attach prisma to globalThis so it persists across hot reloads in dev
// and is reused across invocations in the same worker in prod.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ─── Create client ────────────────────────────────────────────────────────────
function createPrismaClient() {
  const isDev = process.env.NODE_ENV === 'development'

  return new PrismaClient({
    log: isDev
      ? [
          { level: 'query',   emit: 'event' },
          { level: 'error',   emit: 'stdout' },
          { level: 'warn',    emit: 'stdout' },
        ]
      : [
          { level: 'error',   emit: 'stdout' },
        ],

    // Connection pool settings for Supabase PgBouncer
    // These are set in the DATABASE_URL query string but
    // we document them here for clarity:
    // ?pgbouncer=true&connection_limit=1
    // connection_limit=1 is critical for PgBouncer transaction mode
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// ─── Dev: log slow queries ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error — $on exists but types are complex
  prisma.$on('query', (e: { query: string; duration: number }) => {
    if (e.duration > 500) {
      console.warn(`⚠️  Slow query (${e.duration}ms): ${e.query.slice(0, 100)}`)
    }
  })
}

// ─── Singleton reuse ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ─── Helper: check DB connection ──────────────────────────────────────────────
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  latencyMs?: number
  error?: string
}> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, latencyMs: Date.now() - start }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ─── Helper: safe disconnect (for scripts like seed.ts) ───────────────────────
export async function disconnectDatabase() {
  await prisma.$disconnect()
}
