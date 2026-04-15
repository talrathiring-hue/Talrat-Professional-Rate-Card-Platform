import { prisma } from './prisma'
import { PRO_PLAN_PRICE_PAISE } from './razorpay'

// Core SaaS Metrics
export async function calculateMRR(): Promise<number> {
  const activeSubs = await prisma.subscription.count({
    where: { status: 'ACTIVE', plan: 'PRO' },
  })
  return activeSubs * PRO_PLAN_PRICE_PAISE
}

export async function calculateARR(mrr?: number): Promise<number> {
  const m = mrr ?? (await calculateMRR())
  return m * 12
}

export async function calculateChurnRate(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [churned, startOfPeriodPaid] = await Promise.all([
    prisma.subscription.count({
      where: {
        status: 'CANCELLED',
        updatedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.subscription.count({
      where: {
        status: { in: ['ACTIVE', 'CANCELLED'] },
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
  ])

  if (startOfPeriodPaid === 0) return 0
  return (churned / startOfPeriodPaid) * 100
}

export async function calculateLTV(churnRate?: number): Promise<number> {
  const rate = churnRate ?? (await calculateChurnRate())
  if (rate === 0) return PRO_PLAN_PRICE_PAISE * 24 // assume 24 months if no churn
  const avgLifetimeMonths = 100 / rate
  return PRO_PLAN_PRICE_PAISE * avgLifetimeMonths
}

// CAC = total spend / new paid customers (placeholder — update with real ad spend)
export async function calculateCAC(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const newPaid = await prisma.subscription.count({
    where: {
      plan: 'PRO',
      status: 'ACTIVE',
      createdAt: { gte: thirtyDaysAgo },
    },
  })
  // Placeholder: assume ₹500/month marketing spend until real data available
  const estimatedSpend = 50000 // ₹500 in paise
  if (newPaid === 0) return 0
  return estimatedSpend / newPaid
}

export async function calculateNetRevenueRetention(): Promise<number> {
  // Simplified NRR: since we have a flat rate, NRR ≈ (1 - churn rate) * 100
  const churn = await calculateChurnRate()
  return Math.max(0, 100 - churn)
}

export async function calculateRuleOf40(mrr?: number): Promise<number> {
  // Rule of 40 = Growth Rate % + Profit Margin %
  // Simplified: use MoM growth rate as proxy
  const m = mrr ?? (await calculateMRR())
  const prevMonth = await getLastMonthMRR()
  const growthRate = prevMonth > 0 ? ((m - prevMonth) / prevMonth) * 100 : 0
  // Assume 40% margin (SaaS benchmark) until real P&L available
  return growthRate + 40
}

// Growth metrics 

export async function getLastMonthMRR(): Promise<number> {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const snapshot = await prisma.metricsSnapshot.findFirst({
    where: { date: { lte: lastMonth } },
    orderBy: { date: 'desc' },
  })
  return snapshot?.mrr ?? 0
}

export async function getUserGrowthChart(): Promise<
  { month: string; users: number; paid: number }[]
> {
  const results = []
  for (let i = 11; i >= 0; i--) {
    const start = new Date()
    start.setMonth(start.getMonth() - i)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)

    const [users, paid] = await Promise.all([
      prisma.user.count({ where: { createdAt: { lt: end } } }),
      prisma.subscription.count({
        where: { plan: 'PRO', createdAt: { lt: end } },
      }),
    ])

    results.push({
      month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      users,
      paid,
    })
  }
  return results
}

export async function getMRRGrowthChart(): Promise<
  { month: string; mrr: number }[]
> {
  const snapshots = await prisma.metricsSnapshot.findMany({
    orderBy: { date: 'asc' },
    take: 12,
  })

  return snapshots.map((s) => ({
    month: new Date(s.date).toLocaleString('default', { month: 'short', year: '2-digit' }),
    mrr: s.mrr / 100, // convert to rupees for display
  }))
}

// Full metrics snapshot

export async function getFullMetrics() {
  const [
    totalUsers,
    activeUsers,
    paidUsers,
    trialUsers,
    mrr,
    churnRate,
    growthChart,
    mrrChart,
  ] = await Promise.all([
    prisma.user.count({ where: { isBlocked: false } }),
    prisma.user.count({ where: { isBlocked: false, profile: { isPublished: true } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', plan: 'PRO' } }),
    prisma.subscription.count({ where: { status: 'TRIAL' } }),
    calculateMRR(),
    calculateChurnRate(),
    getUserGrowthChart(),
    getMRRGrowthChart(),
  ])

  const arr = await calculateARR(mrr)
  const ltv = await calculateLTV(churnRate)
  const cac = await calculateCAC()
  const nrr = await calculateNetRevenueRetention()
  const ruleOf40 = await calculateRuleOf40(mrr)
  const ltvCacRatio = cac > 0 ? ltv / cac : 0
  const paybackPeriod = cac > 0 ? cac / PRO_PLAN_PRICE_PAISE : 0

  return {
    totalUsers,
    activeUsers,
    paidUsers,
    trialUsers,
    mrr,
    arr,
    churnRate,
    ltv,
    cac,
    nrr,
    ruleOf40,
    ltvCacRatio,
    paybackPeriod,
    growthChart,
    mrrChart,
  }
}

// Save daily snapshot
export async function saveDailySnapshot() {
  const today = new Date(new Date().toDateString())
  const metrics = await getFullMetrics()

  const [profileViews, leadsGenerated] = await Promise.all([
    prisma.analytics.count({
      where: {
        event: 'PROFILE_VIEW',
        createdAt: { gte: today },
      },
    }),
    prisma.lead.count({
      where: { createdAt: { gte: today } },
    }),
  ])

  await prisma.metricsSnapshot.upsert({
    where: { date: today },
    update: {
      totalUsers: metrics.totalUsers,
      activeUsers: metrics.activeUsers,
      paidUsers: metrics.paidUsers,
      trialUsers: metrics.trialUsers,
      mrr: metrics.mrr,
      arr: metrics.arr,
      profileViews,
      leadsGenerated,
    },
    create: {
      date: today,
      totalUsers: metrics.totalUsers,
      activeUsers: metrics.activeUsers,
      paidUsers: metrics.paidUsers,
      trialUsers: metrics.trialUsers,
      mrr: metrics.mrr,
      arr: metrics.arr,
      profileViews,
      leadsGenerated,
    },
  })
}
