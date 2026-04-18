// src/app/api/profile/slug/route.ts
// GET /api/profile/slug?slug=priya-sharma
// Checks if a slug is available — used live in the profile builder
export const runtime = "nodejs"
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidSlug, generateSlug } from '@/lib/utils'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawSlug = searchParams.get('slug')

  if (!rawSlug) {
    return NextResponse.json({ error: 'slug query param is required' }, { status: 400 })
  }

  const slug = generateSlug(rawSlug)

  // Validate format
  if (!isValidSlug(slug)) {
    return NextResponse.json({
      available:  false,
      slug,
      reason:     'Slug can only contain lowercase letters, numbers, and hyphens (3–50 chars)',
    })
  }

  // Reserved slugs that cannot be used
  const RESERVED = [
    'admin', 'api', 'auth', 'dashboard', 'about', 'blog', 'pricing',
    'terms', 'privacy', 'support', 'help', 'login', 'register',
    'signup', 'signin', 'logout', 'home', 'talrat', 'www',
    'app', 'mail', 'email', 'contact', 'careers', 'jobs',
  ]
  if (RESERVED.includes(slug)) {
    return NextResponse.json({
      available: false,
      slug,
      reason:    'This URL is reserved',
    })
  }

  // Check DB — allow if it belongs to the current user
  const existing = await prisma.profile.findUnique({
    where: { slug },
    select: { userId: true },
  })

  const available = !existing || existing.userId === session.user.id

  return NextResponse.json({ available, slug })
}
