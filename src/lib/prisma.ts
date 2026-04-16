// src/lib/prisma.ts
// Fixed for Prisma 5 — no engine options passed to constructor
// These caused the PrismaClientConstructorValidationError

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Health check helper
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
