// src/app/api/admin/users/[id]/route.ts
// PATCH /api/admin/users/:id — block/unblock, promote to admin

import { NextResponse }  from 'next/server'
import { auth }          from '@/lib/auth'
import { prisma }        from '@/lib/prisma'
import { z }             from 'zod'

const schema = z.object({
  isBlocked: z.boolean().optional(),
  role:      z.enum(['TALENT', 'ADMIN']).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent admin from blocking themselves
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot modify your own account from the admin panel' },
      { status: 400 }
    )
  }

  const body   = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const update: Record<string, any> = {}
  if (parsed.data.isBlocked !== undefined) update.isBlocked = parsed.data.isBlocked
  if (parsed.data.role      !== undefined) update.role      = parsed.data.role

  const user = await prisma.user.update({
    where:  { id: params.id },
    data:   update,
    select: { id: true, name: true, email: true, isBlocked: true, role: true },
  })

  return NextResponse.json({ user })
}
