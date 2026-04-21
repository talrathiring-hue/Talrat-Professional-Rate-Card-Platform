
import { auth }          from '@/lib/auth'
import { redirect }      from 'next/navigation'
import { prisma }        from '@/lib/prisma'
import { BillingClient } from '@/app/dashboard/BillingClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Billing' }
export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [subscription, payments] = await Promise.all([
    prisma.subscription.findUnique({
      where:  { userId: session.user.id },
      select: {
        plan:               true,
        status:             true,
        trialEndsAt:        true,
        currentPeriodStart: true,
        currentPeriodEnd:   true,
        razorpayPaymentId:  true,
      },
    }),
    prisma.payment.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select: {
        id:          true,
        amount:      true,
        currency:    true,
        status:      true,
        description: true,
        paymentId:   true,
        createdAt:   true,
      },
    }),
  ])

  // Serialise dates for client
  const serialisedSub = subscription
    ? {
        ...subscription,
        plan:               subscription.plan as string,
        status:             subscription.status as string,
        trialEndsAt:        subscription.trialEndsAt?.toISOString() ?? null,
        currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd:   subscription.currentPeriodEnd?.toISOString() ?? null,
      }
    : null

  const serialisedPayments = payments.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <BillingClient
      subscription={serialisedSub}
      payments={serialisedPayments}
      userEmail={session.user.email ?? ''}
      userName={session.user.name  ?? ''}
    />
  )
}
