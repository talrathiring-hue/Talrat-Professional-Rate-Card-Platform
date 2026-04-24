// Settings page — Account, Notifications, Support
// Server component — fetches user, prefs, and tickets

import { auth }             from '@/lib/auth'
import { redirect }         from 'next/navigation'
import { prisma }           from '@/lib/prisma'
import { SettingsClient }   from '@/app/dashboard/SettingsClient'
import type { Metadata }    from 'next'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [user, prefs, tickets] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: session.user.id },
      select: {
        id:            true,
        name:          true,
        email:         true,
        phone:         true,
        image:         true,
        role:          true,
        createdAt:     true,
      },
    }),

    prisma.notificationPrefs.findFirst({
      where:  { userId: session.user.id },
      select: {
        emailOnLead:    true,
        whatsappOnLead: true,
        weeklyDigest:   true,
      },
    }),

    prisma.supportTicket.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    10,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, body: true, isAdmin: true, createdAt: true,
          },
        },
      },
    }),
  ])

  if (!user) redirect('/auth/login')

  // Serialise dates
  const serialisedUser = {
    ...user,
    role:      user.role as string,
    createdAt: user.createdAt.toISOString(),
  }

  const serialisedTickets = tickets.map(t => ({
    ...t,
    category:  t.category  as string,
    priority:  t.priority  as string,
    status:    t.status    as string,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messages:  t.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }))

  return (
    <SettingsClient
      user={serialisedUser}
      prefs={prefs ?? { emailOnLead: true, whatsappOnLead: true, weeklyDigest: true }}
      tickets={serialisedTickets}
    />
  )
}
