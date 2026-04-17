// - Graceful fallback when Upstash not configured (dev without Redis)
// - Connection health check
// - Typed cache helpers
// - Better rate limiter configs

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// ─── Feature flag ─────────────────────────────────────────────────────────────
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// ─── Redis client ─────────────────────────────────────────────────────────────
// Lazy singleton — only created if Redis is configured
let _redis: Redis | null = null

function getRedis(): Redis {
  if (!isRedisConfigured) {
    throw new Error(
      'Upstash Redis is not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local\n' +
      'Get them free at: upstash.com → Create Database → REST API'
    )
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

export { getRedis as redis }

// ─── Rate limiters ────────────────────────────────────────────────────────────
// Each limiter is created lazily (only when Redis is available)

let _profileViewLimiter: Ratelimit | null = null
let _contactFormLimiter: Ratelimit | null = null
let _authLimiter: Ratelimit | null = null
let _apiLimiter: Ratelimit | null = null

// Profile views: 10 per IP per hour per profile slug
export function getProfileViewLimiter(): Ratelimit {
  if (!_profileViewLimiter) {
    _profileViewLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'rl:profile-view',
    })
  }
  return _profileViewLimiter
}

// Contact form: 3 submissions per IP per 24 hours
export function getContactFormLimiter(): Ratelimit {
  if (!_contactFormLimiter) {
    _contactFormLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(3, '24 h'),
      analytics: true,
      prefix: 'rl:contact',
    })
  }
  return _contactFormLimiter
}

// Auth: 5 attempts per IP per 15 minutes
export function getAuthLimiter(): Ratelimit {
  if (!_authLimiter) {
    _authLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'rl:auth',
    })
  }
  return _authLimiter
}

// General API: 60 requests per IP per minute
export function getApiLimiter(): Ratelimit {
  if (!_apiLimiter) {
    _apiLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'rl:api',
    })
  }
  return _apiLimiter
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_TTL = {
  profile:  300,   // 5 minutes — public profile pages
  session:  60,    // 1 minute — session data
  analytics: 3600, // 1 hour — analytics aggregates
  metrics:  300,   // 5 minutes — admin metrics
} as const

// Generic get with type safety
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured) return null
  try {
    const data = await getRedis().get<T>(key)
    return data
  } catch {
    return null
  }
}

// Generic set
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  if (!isRedisConfigured) return
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value))
  } catch {
    // Cache failures are non-fatal
  }
}

// Delete a key
export async function cacheDel(key: string): Promise<void> {
  if (!isRedisConfigured) return
  try {
    await getRedis().del(key)
  } catch {
    // Non-fatal
  }
}

// ─── Profile-specific cache ───────────────────────────────────────────────────
export async function getCachedProfile(slug: string) {
  return cacheGet<Record<string, unknown>>(`cache:profile:${slug}`)
}

export async function setCachedProfile(slug: string, data: unknown) {
  return cacheSet(`cache:profile:${slug}`, data, CACHE_TTL.profile)
}

export async function invalidateProfileCache(slug: string) {
  return cacheDel(`cache:profile:${slug}`)
}

// ─── Health check ─────────────────────────────────────────────────────────────
export async function checkRedisConnection(): Promise<{
  connected: boolean
  configured: boolean
  latencyMs?: number
  error?: string
}> {
  if (!isRedisConfigured) {
    return { connected: false, configured: false }
  }

  const start = Date.now()
  try {
    await getRedis().ping()
    return {
      connected: true,
      configured: true,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    return {
      connected: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ─── IP extraction ────────────────────────────────────────────────────────────
// Extracts real IP from Vercel/Cloudflare headers
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const vercel = request.headers.get('x-vercel-forwarded-for')

  const ip =
    vercel?.split(',')[0]?.trim() ??
    forwarded?.split(',')[0]?.trim() ??
    real ??
    '127.0.0.1'

  return ip
}

// ─── Rate limit response helper ───────────────────────────────────────────────
export function rateLimitResponse(reset: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(reset),
      },
    }
  )
}

// Export flag for other files to check
export { isRedisConfigured }
