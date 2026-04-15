import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

//  Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

//  Rate limiters
// Profile view tracking: 10 views per IP per hour per profile
export const profileViewLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'rl:profile-view',
})

// Contact form: 3 submissions per IP per 24 hours
export const contactFormLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '24 h'),
  analytics: true,
  prefix: 'rl:contact-form',
})

// Auth attempts: 5 per IP per 15 minutes
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'rl:auth',
})

//Cache helpers
const PROFILE_CACHE_TTL = 300 // 5 minutes in seconds

export async function getCachedProfile(slug: string) {
  try {
    return await redis.get<Record<string, unknown>>(`cache:profile:${slug}`)
  } catch {
    return null
  }
}

export async function setCachedProfile(slug: string, data: unknown) {
  try {
    await redis.setex(`cache:profile:${slug}`, PROFILE_CACHE_TTL, JSON.stringify(data))
  } catch {
    // Cache failures are non-fatal
  }
}

export async function invalidateProfileCache(slug: string) {
  try {
    await redis.del(`cache:profile:${slug}`)
  } catch {
    // Non-fatal
  }
}

//  IP extraction helper
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? real ?? '127.0.0.1'
}
