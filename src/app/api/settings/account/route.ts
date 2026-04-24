
// PATCH /api/settings/account — update name + phone
// DELETE /api/settings/account — delete account + all data

import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { prisma }       from '@/lib/prisma'
import { z }            from 'zod'

const patchSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(80).optional(),
  phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number (10 digits)')
    .optional()
    .or(z.literal('')),
})

// ─── PATCH — update name / phone ─────────────────────────────────────────────
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body   = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const update: Record<string, any> = {}
  if (parsed.data.name  !== undefined) update.name  = parsed.data.name
  if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null

  const user = await prisma.user.update({
    where:  { id: session.user.id },
    data:   update,
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json({ user })
}

// ─── DELETE — delete account + all data ─────────────────────────────────────
export async function DELETE() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Cascade delete — Prisma handles relations via onDelete: Cascade in schema
  // Order matters: delete dependents first if not cascaded
  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }
}
