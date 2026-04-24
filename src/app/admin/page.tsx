
// Admin overview — business metrics: MRR, ARR, users, trials, churn
// + signup trend chart + recent signups + open tickets snapshot

import { auth }      from '@/lib/auth'
import { redirect }  from 'next/navigation'
import { prisma }    from '@/lib/prisma'
import { AdminOverviewClient } from '@/components/admin/AdminOverviewClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Overview' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const now       = new Date()
  const day30ago  = new Date(now); day30ago.setDate(day30ago.getDate() - 30)
  const day7ago   = new Date(now); day7ago.setDate(day7ago.getDate() - 7)

  const [
    totalUsers,
    newUsers30d,
    newUsers7d,
    proUsers,
    trialUsers,
    totalProfiles,
    publishedProfiles,
    totalLeads,
    openTickets,
    recentSignups,
    signupsByDay,
    totalRevenue,
  ] = await Promise.all([

    prisma.user.count(),

    prisma.user.count({ where: { createdAt: { gte: day30ago } } }),

    prisma.user.count({ where: { createdAt: { gte: day7ago } } }),

    prisma.subscription.count({
      where: { status: 'ACTIVE', plan: 'PRO' },
    }),

    prisma.subscription.count({
      where: { status: 'TRIAL' },
    }),

    prisma.profile.count(),

    prisma.profile.count({ where: { isPublished: true } }),

    prisma.lead.count(),

    prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),

    // Last 10 signups
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take:    10,
      select: {
        id:        true,
        name:      true,
        email:     true,
        createdAt: true,
        subscription: { select: { plan: true, status: true } },
        profile:      { select: { slug: true, isPublished: true } },
      },
    }),

    // Signups per day — last 30 days
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${day30ago}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Total captured revenue (paise)
    prisma.payment.aggregate({
      where:  { status: 'CAPTURED' },
      _sum:   { amount: true },
    }),
  ])

  // Build 30-day signup chart (fill zeros)
  function buildChart(rows: { date: string; count: bigint }[]) {
    const map = new Map<string, number>()
    rows.forEach(r => {
      const d = typeof r.date === 'string'
        ? r.date.slice(0, 10)
        : new Date(r.date).toISOString().slice(0, 10)
      map.set(d, Number(r.count))
    })
    const result: { date: string; value: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d   = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const lbl = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      result.push({ date: lbl, value: map.get(key) ?? 0 })
    }
    return result
  }

  // MRR = PRO users × ₹499
  const mrr = proUsers * 499
  const arr = mrr * 12

  const serialised = {
    stats: {
      totalUsers,
      newUsers30d,
      newUsers7d,
      proUsers,
      trialUsers,
      totalProfiles,
      publishedProfiles,
      totalLeads,
      openTickets,
      mrr,
      arr,
      totalRevenuePaise: Number(totalRevenue._sum.amount ?? 0),
    },
    signupChart: buildChart(signupsByDay),
    recentSignups: recentSignups.map(u => ({
      ...u,
      createdAt:    u.createdAt.toISOString(),
      subscription: u.subscription,
    })),
  }

  return <AdminOverviewClient data={serialised} />
}
