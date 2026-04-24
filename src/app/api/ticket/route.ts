// GET  /api/tickets — fetch the user's support tickets
// POST /api/tickets — create a new support ticket

import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { prisma }       from '@/lib/prisma'
import { z }            from 'zod'

const createSchema = z.object({
  subject:  z.string().min(5, 'Subject must be at least 5 characters').max(120),
  message:  z.string().min(20, 'Message must be at least 20 characters').max(2000),
  category: z.enum(['BILLING', 'TECHNICAL', 'ACCOUNT', 'FEATURE_REQUEST', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

// ─── GET — list user's tickets ────────────────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const tickets = await prisma.supportTicket.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
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

  // Serialise dates
  const serialised = tickets.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messages:  t.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }))

  return NextResponse.json({ tickets: serialised })
}

// ─── POST — create ticket ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body   = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { subject, message, category, priority } = parsed.data

  // Check open ticket limit (max 5 open tickets)
  const openCount = await prisma.supportTicket.count({
    where: {
      userId: session.user.id,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
  })
  if (openCount >= 5) {
    return NextResponse.json(
      { error: 'You have too many open tickets. Please wait for existing ones to be resolved.' },
      { status: 429 }
    )
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId:   session.user.id,
      subject,
      category: category as any,
      priority: (priority ?? 'MEDIUM') as any,
      status:   'OPEN',
      messages: {
        create: {
          body,
          isAdmin: false,
          userId:  session.user.id,
        },
      },
    },
    include: {
      messages: {
        select: {
          id: true, body: true, isAdmin: true, createdAt: true,
        },
      },
    },
  })

  const serialised = {
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    messages:  ticket.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }

  return NextResponse.json({ ticket: serialised }, { status: 201 })
}
