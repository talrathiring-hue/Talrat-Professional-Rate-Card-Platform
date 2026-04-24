// src/app/admin/users/page.tsx
// User management — list all users with search + plan filter + block/unblock

import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma }   from '@/lib/prisma'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Users' }
export const dynamic = 'force-dynamic'

interface SearchParams { q?: string; plan?: string; page?: string }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const q    = searchParams.q ?? ''
  const plan = searchParams.plan ?? 'all'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const take = 25
  const skip = (page - 1) * take

  // Build where clause
  const where: any = {}
  if (q) {
    where.OR = [
      { name:  { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (plan === 'pro')   where.subscription = { is: { status: 'ACTIVE' } }
  if (plan === 'trial') where.subscription = { is: { status: 'TRIAL'  } }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        role:      true,
        isBlocked: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true, trialEndsAt: true } },
        profile:      { select: { slug: true, isPublished: true, totalViews: true, totalLeads: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const serialised = users.map(u => ({
    ...u,
    role:      u.role as string,
    createdAt: u.createdAt.toISOString(),
    subscription: u.subscription
      ? {
          ...u.subscription,
          plan:        u.subscription.plan as string,
          status:      u.subscription.status as string,
          trialEndsAt: u.subscription.trialEndsAt?.toISOString() ?? null,
        }
      : null,
  }))

  return (
    <AdminUsersClient
      users={serialised}
      total={total}
      page={page}
      pageSize={take}
      query={q}
      planFilter={plan}
    />
  )
}
