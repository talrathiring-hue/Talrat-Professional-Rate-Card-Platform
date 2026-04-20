// src/app/[slug]/page.tsx
// Public profile page — talrat.com/priya-sharma
// ISR: revalidates every 60 seconds
// Redis: cached for 5 minutes for instant repeat loads
// Full SEO metadata + JSON-LD structured data

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCachedProfile, setCachedProfile } from '@/lib/redis'
import { PublicProfilePage } from '@/components/public/PublicProfilePage'
import type { Metadata } from 'next'
import { TALENT_TYPE_LABELS } from '@/lib/utils'

// ─── ISR config ───────────────────────────────────────────────────────────────
export const revalidate = 60 // revalidate every 60 seconds

// ─── Types ────────────────────────────────────────────────────────────────────
interface PageProps {
  params: { slug: string }
}

// ─── Data fetcher (with Redis cache) ─────────────────────────────────────────
async function getProfile(slug: string) {
  // Try Redis cache first
  const cached = await getCachedProfile(slug)
  if (cached) return cached as any

  // Fetch from DB
  const profile = await prisma.profile.findUnique({
    where:   { slug, isPublished: true },
    include: {
      user:        { select: { name: true, image: true, email: true } },
      skills:      { orderBy: { order: 'asc' } },
      workSamples: { orderBy: { order: 'asc' } },
    },
  })

  if (!profile) return null

  // Serialise (convert paise → rupees for display, remove sensitive fields)
  const serialised = {
    id:          profile.id,
    slug:        profile.slug,
    talentType:  profile.talentType,
    displayName: profile.displayName,
    headline:    profile.headline,
    bio:         profile.bio,
    location:    profile.location,
    experience:  profile.experience,
    availability: profile.availability,
    avatarUrl:   profile.user.image,

    tier1Label:  profile.tier1Label,
    tier1Price:  profile.tier1Price ? Math.round(profile.tier1Price / 100) : null,
    tier1Desc:   profile.tier1Desc,
    tier2Label:  profile.tier2Label,
    tier2Price:  profile.tier2Price ? Math.round(profile.tier2Price / 100) : null,
    tier2Desc:   profile.tier2Desc,
    tier2Popular: profile.tier2Popular,
    tier3Label:  profile.tier3Label,
    tier3Price:  profile.tier3Price ? Math.round(profile.tier3Price / 100) : null,
    tier3Desc:   profile.tier3Desc,

    websiteUrl:   profile.websiteUrl,
    linkedinUrl:  profile.linkedinUrl,
    twitterUrl:   profile.twitterUrl,
    githubUrl:    profile.githubUrl,
    instagramUrl: profile.instagramUrl,
    youtubeUrl:   profile.youtubeUrl,
    dribbbleUrl:  profile.dribbbleUrl,
    behanceUrl:   profile.behanceUrl,

    skills:      profile.skills.map(s => s.name),
    workSamples: profile.workSamples.map(w => ({
      title:       w.title,
      url:         w.url,
      description: w.description,
    })),
    totalViews: profile.totalViews,
    totalLeads: profile.totalLeads,
  }

  // Cache in Redis
  await setCachedProfile(slug, serialised)

  return serialised
}

// ─── Metadata (SEO) ───────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getProfile(params.slug)
  if (!profile) return { title: 'Profile not found' }

  const typeLabel  = TALENT_TYPE_LABELS[profile.talentType]
  const title      = `${profile.displayName} — ${typeLabel}`
  const description = profile.headline ??
    `${profile.displayName} is a ${typeLabel}${profile.location ? ` based in ${profile.location}` : ''}. View their rate card and get in touch on talrat.com.`
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'
  const url        = `${appUrl}/${profile.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Talrat',
      type:     'profile',
      images:   profile.avatarUrl
        ? [{ url: profile.avatarUrl, width: 400, height: 400, alt: profile.displayName }]
        : [{ url: `${appUrl}/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary',
      title,
      description,
      images:      profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
    alternates: { canonical: url },
    robots:     { index: true, follow: true },
  }
}

//  Page
export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfile(params.slug)
  if (!profile) notFound()

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'
  const typeLabel = TALENT_TYPE_LABELS[profile.talentType]

  // JSON-LD structured data
  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Person',
    name:         profile.displayName,
    jobTitle:     typeLabel,
    description:  profile.headline ?? undefined,
    url:          `${appUrl}/${profile.slug}`,
    image:        profile.avatarUrl ?? undefined,
    address:      profile.location
      ? { '@type': 'PostalAddress', addressLocality: profile.location }
      : undefined,
    sameAs: [
      profile.linkedinUrl,
      profile.twitterUrl,
      profile.githubUrl,
      profile.websiteUrl,
    ].filter(Boolean),
    offers: [
      profile.tier1Label && profile.tier1Price
        ? { '@type': 'Offer', name: profile.tier1Label, price: profile.tier1Price, priceCurrency: 'INR' }
        : null,
      profile.tier2Label && profile.tier2Price
        ? { '@type': 'Offer', name: profile.tier2Label, price: profile.tier2Price, priceCurrency: 'INR' }
        : null,
      profile.tier3Label && profile.tier3Price
        ? { '@type': 'Offer', name: profile.tier3Label, price: profile.tier3Price, priceCurrency: 'INR' }
        : null,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicProfilePage profile={profile} />
    </>
  )
}

// ─── Static params (optional — pre-build popular profiles) ───────────────────
export async function generateStaticParams() {
  // Pre-build the first 100 published profiles at build time
  // The rest are generated on first request (ISR)
  try {
    const profiles = await prisma.profile.findMany({
      where:   { isPublished: true },
      select:  { slug: true },
      orderBy: { totalViews: 'desc' },
      take:    100,
    })
    return profiles.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}
