// src/app/api/admin/tickets/[id]/reply/route.ts
// POST — add admin reply to ticket
// PATCH — update ticket status

import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { prisma }       from '@/lib/prisma'
import { z }            from 'zod'

const replySchema  = z.object({ body: z.string().min(1).max(2000) })
const statusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
})

// ── POST: add reply ───────────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body   = await request.json()
  const parsed = replySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
  })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Add admin message + update status to IN_PROGRESS if it was OPEN
  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        body:     parsed.data.body,
        isAdmin:  true,
      },
    }),
    prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status:    ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        updatedAt: new Date(),
      },
    }),
  ])

  return NextResponse.json({ message })
}

// ── PATCH: update status ──────────────────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body   = await request.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: params.id },
    data:  { status: parsed.data.status as any, updatedAt: new Date() },
    select: { id: true, status: true },
  })

  return NextResponse.json({ ticket })
}
