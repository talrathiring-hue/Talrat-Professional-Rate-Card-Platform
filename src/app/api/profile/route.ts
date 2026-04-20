
import { NextResponse }           from 'next/server'
import { auth }                   from '@/lib/auth'
import { prisma }                 from '@/lib/prisma'
import { generateSlug, isValidSlug, rupeesToPaise } from '@/lib/utils'
import { z }                      from 'zod'
import { invalidateProfileCache } from '@/lib/redis'

// ─── Validation schema ───────────────────────────────────────────────────────
const profileSchema = z.object({
  talentType:   z.string().min(1, 'Talent type is required'),
  displayName:  z.string().min(2).max(60),
  slug:         z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
  headline:     z.string().max(160).optional(),
  bio:          z.string().max(1000).optional(),
  location:     z.string().max(60).optional(),
  experience:   z.number().int().min(0).max(50).optional(),
  availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).optional(),

  // Rate card — prices in INR rupees (converted to paise before storing)
  tier1Label:   z.string().max(40).optional(),
  tier1Price:   z.number().min(0).optional(),
  tier1Desc:    z.string().max(200).optional(),
  tier2Label:   z.string().max(40).optional(),
  tier2Price:   z.number().min(0).optional(),
  tier2Desc:    z.string().max(200).optional(),
  tier2Popular: z.boolean().optional(),
  tier3Label:   z.string().max(40).optional(),
  tier3Price:   z.number().min(0).optional(),
  tier3Desc:    z.string().max(200).optional(),

  // Social links
  websiteUrl:   z.string().url().optional().or(z.literal('')),
  linkedinUrl:  z.string().url().optional().or(z.literal('')),
  twitterUrl:   z.string().url().optional().or(z.literal('')),
  githubUrl:    z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl:   z.string().url().optional().or(z.literal('')),
  dribbbleUrl:  z.string().url().optional().or(z.literal('')),
  behanceUrl:   z.string().url().optional().or(z.literal('')),

  // Adaptive fields stored as JSON
  // Use z.record with z.unknown() — compatible with Prisma v5 Json type
  adaptiveData: z.record(z.unknown()).optional(),

  // Relations
  skills: z.array(z.object({
    name: z.string().min(1).max(30),
  })).max(20).optional(),

  workSamples: z.array(z.object({
    title:       z.string().min(1).max(60),
    url:         z.string().url(),
    description: z.string().max(200).optional(),
  })).max(6).optional(),

  isPublished: z.boolean().optional(),
})

// ─── GET — fetch current user's profile ─────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where:   { userId: session.user.id },
    include: {
      skills:      { orderBy: { order: 'asc' } },
      workSamples: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json({ profile })
}

// ─── POST — create new profile ───────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Prevent duplicate profiles
  const existing = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Profile already exists. Use PATCH to update.' },
      { status: 409 }
    )
  }

  const body   = await request.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const data = parsed.data
  const { skills, workSamples, ...profileData } = data

  // Generate + ensure unique slug
  let slug = profileData.slug ?? generateSlug(profileData.displayName)
  slug     = await ensureUniqueSlug(slug)

  const profile = await prisma.profile.create({
    data: {
      userId:       session.user.id,
      slug,
      // Prisma v5: enum values must be cast with 'as any' or use the Prisma enum directly
      talentType:   profileData.talentType   as any,
      availability: (profileData.availability ?? 'AVAILABLE') as any,
      displayName:  profileData.displayName,
      headline:     profileData.headline     ?? null,
      bio:          profileData.bio          ?? null,
      location:     profileData.location     ?? null,
      experience:   profileData.experience   ?? null,

      tier1Label:   profileData.tier1Label   ?? null,
      tier1Price:   profileData.tier1Price != null ? rupeesToPaise(profileData.tier1Price) : null,
      tier1Desc:    profileData.tier1Desc    ?? null,
      tier2Label:   profileData.tier2Label   ?? null,
      tier2Price:   profileData.tier2Price != null ? rupeesToPaise(profileData.tier2Price) : null,
      tier2Desc:    profileData.tier2Desc    ?? null,
      tier2Popular: profileData.tier2Popular ?? true,
      tier3Label:   profileData.tier3Label   ?? null,
      tier3Price:   profileData.tier3Price != null ? rupeesToPaise(profileData.tier3Price) : null,
      tier3Desc:    profileData.tier3Desc    ?? null,

      websiteUrl:   profileData.websiteUrl   || null,
      linkedinUrl:  profileData.linkedinUrl  || null,
      twitterUrl:   profileData.twitterUrl   || null,
      githubUrl:    profileData.githubUrl    || null,
      instagramUrl: profileData.instagramUrl || null,
      youtubeUrl:   profileData.youtubeUrl   || null,
      dribbbleUrl:  profileData.dribbbleUrl  || null,
      behanceUrl:   profileData.behanceUrl   || null,

      // Prisma v5 Json field — must pass a plain object, not 'as any'
      // z.record(z.unknown()) gives us Record<string, unknown> which is valid
      adaptiveData: profileData.adaptiveData ?? ({} as any),

      skills: skills ? {
        create: skills.map((s, i) => ({ name: s.name, order: i })),
      } : undefined,

      workSamples: workSamples ? {
        create: workSamples.map((w, i) => ({
          title:       w.title,
          url:         w.url,
          description: w.description ?? null,
          order:       i,
        })),
      } : undefined,
    },
    include: {
      skills:      { orderBy: { order: 'asc' } },
      workSamples: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json({ profile }, { status: 201 })
}

// ─── PATCH — update existing profile ────────────────────────────────────────
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!existingProfile) {
    return NextResponse.json(
      { error: 'Profile not found. Use POST to create.' },
      { status: 404 }
    )
  }

  const body   = await request.json()
  const parsed = profileSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const data = parsed.data
  const { skills, workSamples, ...profileData } = data

  // Handle slug change
  let slug = existingProfile.slug
  if (profileData.slug && profileData.slug !== existingProfile.slug) {
    if (!isValidSlug(profileData.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug — lowercase letters, numbers, hyphens only' },
        { status: 400 }
      )
    }
    const taken = await prisma.profile.findFirst({
      where: { slug: profileData.slug, userId: { not: session.user.id } },
    })
    if (taken) {
      return NextResponse.json({ error: 'This URL is already taken' }, { status: 409 })
    }
    slug = profileData.slug
  }

  // Invalidate Redis cache for old slug
  await invalidateProfileCache(existingProfile.slug)

  // Build update payload — only include fields that were sent
  // Using explicit if-checks instead of spread to avoid TypeScript issues with Prisma v5
  const updateData: Record<string, any> = { slug }

  if (profileData.displayName  != null) updateData.displayName  = profileData.displayName
  if (profileData.talentType   != null) updateData.talentType   = profileData.talentType
  if (profileData.headline     !== undefined) updateData.headline     = profileData.headline     ?? null
  if (profileData.bio          !== undefined) updateData.bio          = profileData.bio          ?? null
  if (profileData.location     !== undefined) updateData.location     = profileData.location     ?? null
  if (profileData.experience   !== undefined) updateData.experience   = profileData.experience   ?? null
  if (profileData.availability != null) updateData.availability = profileData.availability
  if (profileData.adaptiveData !== undefined) updateData.adaptiveData = profileData.adaptiveData ?? {}

  if (profileData.tier1Label   !== undefined) updateData.tier1Label   = profileData.tier1Label   ?? null
  if (profileData.tier1Price   !== undefined) updateData.tier1Price   = profileData.tier1Price != null ? rupeesToPaise(profileData.tier1Price) : null
  if (profileData.tier1Desc    !== undefined) updateData.tier1Desc    = profileData.tier1Desc    ?? null
  if (profileData.tier2Label   !== undefined) updateData.tier2Label   = profileData.tier2Label   ?? null
  if (profileData.tier2Price   !== undefined) updateData.tier2Price   = profileData.tier2Price != null ? rupeesToPaise(profileData.tier2Price) : null
  if (profileData.tier2Desc    !== undefined) updateData.tier2Desc    = profileData.tier2Desc    ?? null
  if (profileData.tier2Popular !== undefined) updateData.tier2Popular = profileData.tier2Popular
  if (profileData.tier3Label   !== undefined) updateData.tier3Label   = profileData.tier3Label   ?? null
  if (profileData.tier3Price   !== undefined) updateData.tier3Price   = profileData.tier3Price != null ? rupeesToPaise(profileData.tier3Price) : null
  if (profileData.tier3Desc    !== undefined) updateData.tier3Desc    = profileData.tier3Desc    ?? null

  if (profileData.websiteUrl   !== undefined) updateData.websiteUrl   = profileData.websiteUrl   || null
  if (profileData.linkedinUrl  !== undefined) updateData.linkedinUrl  = profileData.linkedinUrl  || null
  if (profileData.twitterUrl   !== undefined) updateData.twitterUrl   = profileData.twitterUrl   || null
  if (profileData.githubUrl    !== undefined) updateData.githubUrl    = profileData.githubUrl    || null
  if (profileData.instagramUrl !== undefined) updateData.instagramUrl = profileData.instagramUrl || null
  if (profileData.youtubeUrl   !== undefined) updateData.youtubeUrl   = profileData.youtubeUrl   || null
  if (profileData.dribbbleUrl  !== undefined) updateData.dribbbleUrl  = profileData.dribbbleUrl  || null
  if (profileData.behanceUrl   !== undefined) updateData.behanceUrl   = profileData.behanceUrl   || null
  if (profileData.isPublished  !== undefined) updateData.isPublished  = profileData.isPublished

  // Replace skills if provided
  if (skills !== undefined) {
    updateData.skills = {
      deleteMany: {},
      create: skills.map((s, i) => ({ name: s.name, order: i })),
    }
  }

  // Replace work samples if provided
  if (workSamples !== undefined) {
    updateData.workSamples = {
      deleteMany: {},
      create: workSamples.map((w, i) => ({
        title:       w.title,
        url:         w.url,
        description: w.description ?? null,
        order:       i,
      })),
    }
  }

  const profile = await prisma.profile.update({
    where:   { userId: session.user.id },
    data:    updateData,
    include: {
      skills:      { orderBy: { order: 'asc' } },
      workSamples: { orderBy: { order: 'asc' } },
    },
  })

  // Invalidate cache for new slug too
  await invalidateProfileCache(slug)

  return NextResponse.json({ profile })
}

// ─── Helper: unique slug generation ─────────────────────────────────────────
async function ensureUniqueSlug(base: string): Promise<string> {
  let slug    = base
  let attempt = 0
  while (true) {
    const existing = await prisma.profile.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}
