// Health check endpoint — GET /api/health
// Shows status of: database, Redis, env vars, all services
// Used to verify everything is wired up correctly

import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/prisma'
import { checkRedisConnection, isRedisConfigured } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  // ── Check all services in parallel ────────────────────────────────────────
  const [db, redis] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ])

  // ── Check env vars ────────────────────────────────────────────────────────
  const envStatus = {
    // Required — app breaks without these
    database:    !!process.env.DATABASE_URL,
    directUrl:   !!process.env.DIRECT_URL,
    authSecret:  !!process.env.AUTH_SECRET,

    // Day 2 — auth
    googleAuth:  !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    resendEmail: !!process.env.RESEND_API_KEY,

    // Day 5 — Redis
    upstashRedis: isRedisConfigured,

    // Future days
    twilio:      !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    razorpay:    !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    cronSecret:  !!process.env.CRON_SECRET,
  }

  // ── Overall health ────────────────────────────────────────────────────────
  const coreHealthy = db.connected && envStatus.database && envStatus.authSecret
  const status = coreHealthy ? 'healthy' : 'degraded'

  const response = {
    status,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    responseMs: Date.now() - start,

    services: {
      database: {
        status: db.connected ? 'connected' : 'error',
        latencyMs: db.latencyMs,
        error: db.error,
        provider: 'Supabase PostgreSQL',
      },
      redis: {
        status: redis.connected
          ? 'connected'
          : redis.configured
          ? 'error'
          : 'not_configured',
        configured: redis.configured,
        latencyMs: redis.latencyMs,
        error: redis.error,
        provider: 'Upstash Redis',
      },
    },

    environment_variables: envStatus,

    // What is ready vs what still needs setting up
    ready: {
      core:         coreHealthy,
      googleAuth:   envStatus.googleAuth,
      emailMagicLink: envStatus.resendEmail,
      caching:      redis.connected,
      rateLimiting: redis.connected,
      whatsapp:     envStatus.twilio,
      payments:     envStatus.razorpay,
    },

    // Human-readable next steps for any missing config
    missing: [
      !envStatus.googleAuth && 'GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (console.cloud.google.com)',
      !envStatus.resendEmail && 'RESEND_API_KEY (resend.com)',
      !envStatus.upstashRedis && 'UPSTASH_REDIS_REST_URL + TOKEN (upstash.com)',
      !envStatus.twilio && 'TWILIO_ACCOUNT_SID + AUTH_TOKEN + WHATSAPP_FROM (twilio.com)',
      !envStatus.razorpay && 'RAZORPAY_KEY_ID + KEY_SECRET (razorpay.com)',
      !envStatus.cronSecret && 'CRON_SECRET (any random string for cron protection)',
    ].filter(Boolean),
  }

  return NextResponse.json(response, {
    status: coreHealthy ? 200 : 503,
  })
}
