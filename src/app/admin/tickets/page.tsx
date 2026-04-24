// src/app/admin/tickets/page.tsx
// Support ticket management — list all tickets, filter by status, reply

import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma }   from '@/lib/prisma'
import { AdminTicketsClient } from '@/components/admin/AdminTicketsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tickets' }
export const dynamic = 'force-dynamic'

interface SearchParams { status?: string }

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const statusFilter = searchParams.status ?? 'open'

  const where: any = {}
  if (statusFilter === 'open')     where.status = { in: ['OPEN', 'IN_PROGRESS'] }
  if (statusFilter === 'resolved') where.status = { in: ['RESOLVED', 'CLOSED'] }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take:    50,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id:        true,
          body:      true,
          isAdmin:   true,
          createdAt: true,
        },
      },
    },
  })

  const serialised = tickets.map(t => ({
    ...t,
    category:  (t as any).category as string ?? 'OTHER',
    status:    t.status   as string,
    priority:  t.priority as string,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messages:  t.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }))

  const counts = await prisma.supportTicket.groupBy({
    by:     ['status'],
    _count: { _all: true },
  })

  const openCount     = counts
    .filter(c => ['OPEN', 'IN_PROGRESS'].includes(c.status as string))
    .reduce((s, c) => s + c._count._all, 0)
  const resolvedCount = counts
    .filter(c => ['RESOLVED', 'CLOSED'].includes(c.status as string))
    .reduce((s, c) => s + c._count._all, 0)

  return (
    <AdminTicketsClient
      tickets={serialised}
      statusFilter={statusFilter}
      openCount={openCount}
      resolvedCount={resolvedCount}
    />
  )
}
