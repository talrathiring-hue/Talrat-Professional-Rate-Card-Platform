// src/app/dashboard/share/page.tsx
// Share kit page — fetches profile and renders 4 channel templates

import { auth }           from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { prisma }         from '@/lib/prisma'
import { ShareKitClient } from '@/app/dashboard/ShareKitClient'
import type { Metadata }  from 'next'

export const metadata: Metadata = { title: 'Share Kit' }

export default async function SharePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({
    where:  { userId: session.user.id },
    select: {
      slug:        true,
      displayName: true,
      talentType:  true,
      headline:    true,
      location:    true,
      experience:  true,
      tier2Label:  true,
      tier2Price:  true,
      tier1Label:  true,
      tier1Price:  true,
      isPublished: true,
      skills:      {
        select:  { name: true },
        orderBy: { order: 'asc' },
        take:    5,
      },
    },
  })

  const serialised = profile
    ? {
        ...profile,
        talentType: profile.talentType as string,
        tier1Price: profile.tier1Price ? Math.round(profile.tier1Price / 100) : null,
        tier2Price: profile.tier2Price ? Math.round(profile.tier2Price / 100) : null,
        skills:     profile.skills.map(s => s.name),
      }
    : null

  return (
    <ShareKitClient
      profile={serialised}
      userName={session.user.name ?? ''}
    />
  )
}
