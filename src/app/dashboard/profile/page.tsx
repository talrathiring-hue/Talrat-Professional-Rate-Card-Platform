
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfileBuilderClient } from '@/app/dashboard/ProfileBuilderClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile Builder' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  // Fetch existing profile to pre-fill the wizard
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills:      { orderBy: { order: 'asc' } },
      workSamples: { orderBy: { order: 'asc' } },
    },
  })

  // Serialise for client (convert BigInt/Date etc)
  const serialised = profile
    ? JSON.parse(JSON.stringify(profile, (_, v) =>
        typeof v === 'bigint' ? Number(v) : v
      ))
    : null

  return (
    <ProfileBuilderClient
      existingProfile={serialised}
      userId={session.user.id}
      userName={session.user.name ?? ''}
    />
  )
}
