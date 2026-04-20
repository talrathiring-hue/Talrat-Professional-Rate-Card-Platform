// src/app/dashboard/analytics/page.tsx
// Analytics dashboard — profile views, lead sources, locations, leads table
// Server component — fetches aggregated data and passes to client charts

import { auth }      from '@/lib/auth'
import { redirect }  from 'next/navigation'
import { prisma }    from '@/lib/prisma'
import { AnalyticsClient } from '@/app/dashboard/AnalyticsClient'
import type { Metadata }   from 'next'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

// ─── Date helpers ─────────────────────────────────────────────────────────────
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = session.user.id

  // Find the user's profile
  const profile = await prisma.profile.findUnique({
    where:  { userId },
    select: { id: true, slug: true, totalViews: true, totalLeads: true },
  })

  if (!profile) {
    return (
      <div className="animate-fade-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-display">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Views, leads and traffic sources</p>
        </div>
        <div className="card p-10 text-center">
          <p className="text-2xl mb-3">📊</p>
          <p className="text-base font-semibold text-slate-900 mb-2">No profile yet</p>
          <p className="text-sm text-slate-500 mb-4">
            Create and publish your profile to start tracking analytics.
          </p>
          <a href="/dashboard/profile" className="btn-primary text-sm inline-flex">
            Build your profile →
          </a>
        </div>
      </div>
    )
  }

  const now      = new Date()
  const day30ago = daysAgo(30)
  const day7ago  = daysAgo(7)

  // ── Parallel data fetching ──────────────────────────────────────────────────
  const [
    totalViewsAll,
    viewsLast30,
    viewsLast7,
    leadsLast30,
    leadsLast7,
    viewsByDay,
    topSources,
    topLocations,
    recentLeads,
    leadsByDay,
  ] = await Promise.all([

    // Total all-time views
    prisma.analytics.count({
      where: { profileId: profile.id, event: 'PROFILE_VIEW' },
    }),

    // Views last 30 days
    prisma.analytics.count({
      where: {
        profileId: profile.id,
        event:     'PROFILE_VIEW',
        createdAt: { gte: day30ago },
      },
    }),

    // Views last 7 days
    prisma.analytics.count({
      where: {
        profileId: profile.id,
        event:     'PROFILE_VIEW',
        createdAt: { gte: day7ago },
      },
    }),

    // Leads last 30 days
    prisma.lead.count({
      where: {
        profileId: profile.id,
        createdAt: { gte: day30ago },
      },
    }),

    // Leads last 7 days
    prisma.lead.count({
      where: {
        profileId: profile.id,
        createdAt: { gte: day7ago },
      },
    }),

    // Views per day — last 30 days (raw query for grouping)
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Analytics"
      WHERE
        "profileId" = ${profile.id}
        AND event = 'PROFILE_VIEW'
        AND "createdAt" >= ${day30ago}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Top traffic sources
    prisma.$queryRaw<{ source: string | null; count: bigint }[]>`
      SELECT
        source,
        COUNT(*) as count
      FROM "Analytics"
      WHERE
        "profileId" = ${profile.id}
        AND event = 'PROFILE_VIEW'
        AND "createdAt" >= ${day30ago}
      GROUP BY source
      ORDER BY count DESC
      LIMIT 8
    `,

    // Top visitor locations (country codes)
    prisma.$queryRaw<{ location: string | null; count: bigint }[]>`
      SELECT
        location,
        COUNT(*) as count
      FROM "Analytics"
      WHERE
        "profileId" = ${profile.id}
        AND event = 'PROFILE_VIEW'
        AND "createdAt" >= ${day30ago}
      GROUP BY location
      ORDER BY count DESC
      LIMIT 8
    `,

    // Recent leads (last 20)
    prisma.lead.findMany({
      where:   { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    }),

    // Leads per day — last 30 days
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Lead"
      WHERE
        "profileId" = ${profile.id}
        AND "createdAt" >= ${day30ago}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ])

  // ── Build 30-day chart data (fill missing days with 0) ─────────────────────
  function buildDailyChart(
    rows: { date: string; count: bigint }[],
    days = 30
  ): { date: string; value: number }[] {
    const map = new Map<string, number>()
    rows.forEach(r => {
      const d = typeof r.date === 'string'
        ? r.date.slice(0, 10)
        : new Date(r.date).toISOString().slice(0, 10)
      map.set(d, Number(r.count))
    })

    const result: { date: string; value: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d    = daysAgo(i)
      const key  = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      result.push({ date: label, value: map.get(key) ?? 0 })
    }
    return result
  }

  const viewsChart  = buildDailyChart(viewsByDay,  30)
  const leadsChart  = buildDailyChart(leadsByDay,  30)

  // Serialise (BigInt → number, Date → string)
  const serialisedLeads = recentLeads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }))

  const serialisedSources = topSources.map(s => ({
    source: s.source ?? 'Direct',
    count:  Number(s.count),
  }))

  const serialisedLocations = topLocations.map(l => ({
    location: l.location ?? 'Unknown',
    count:    Number(l.count),
  }))

  return (
    <AnalyticsClient
      stats={{
        totalViews:  totalViewsAll,
        viewsLast30,
        viewsLast7,
        totalLeads:  profile.totalLeads,
        leadsLast30,
        leadsLast7,
      }}
      viewsChart={viewsChart}
      leadsChart={leadsChart}
      topSources={serialisedSources}
      topLocations={serialisedLocations}
      recentLeads={serialisedLeads}
      profileSlug={profile.slug}
    />
  )
}
