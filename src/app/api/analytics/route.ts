
// Records analytics events (profile views, contact clicks)
// Rate limited per IP to prevent artificial inflation

import { NextResponse }                   from 'next/server'
import { prisma }                         from '@/lib/prisma'
import { getProfileViewLimiter, getClientIP, rateLimitResponse, isRedisConfigured } from '@/lib/redis'
import { z }                              from 'zod'

const schema = z.object({
  profileSlug: z.string().min(1),
  event:       z.enum(['PROFILE_VIEW', 'CONTACT_CLICK', 'WHATSAPP_CLICK', 'LINK_CLICK']),
})

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { profileSlug, event } = parsed.data
    const ip = getClientIP(request)

    // Rate limit only if Redis is configured
    if (isRedisConfigured) {
      try {
        const limiter = getProfileViewLimiter()
        const { success, reset } = await limiter.limit(`${ip}:${profileSlug}`)
        if (!success) return rateLimitResponse(reset)
      } catch {
        // Non-fatal — continue without rate limiting if Redis fails
      }
    }

    // Find profile
    const profile = await prisma.profile.findUnique({
      where:  { slug: profileSlug },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ ok: false })
    }

    // Get referrer and location from headers
    const source    = request.headers.get('referer') ?? undefined
    const country   = request.headers.get('x-vercel-ip-country') ??
                      request.headers.get('cf-ipcountry') ??
                      undefined

    // Write event + increment counter in parallel
    await Promise.all([
      prisma.analytics.create({
        data: {
          profileId: profile.id,
          event,
          source:    source ? new URL(source).hostname : undefined,
          location:  country,
          ip,
        },
      }),
      event === 'PROFILE_VIEW'
        ? prisma.profile.update({
            where: { id: profile.id },
            data:  { totalViews: { increment: 1 } },
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    // Analytics failures are non-fatal — never crash the page
    return NextResponse.json({ ok: false })
  }
}
