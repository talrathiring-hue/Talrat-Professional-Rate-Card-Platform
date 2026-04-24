
// PATCH /api/settings/notifications — update notification preferences

import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { prisma }       from '@/lib/prisma'
import { z }            from 'zod'

const schema = z.object({
  emailOnLead:    z.boolean().optional(),
  whatsappOnLead: z.boolean().optional(),
  weeklyDigest:   z.boolean().optional(),
})

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body   = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const update: Record<string, boolean> = {}
  if (parsed.data.emailOnLead    !== undefined) update.emailOnLead    = parsed.data.emailOnLead
  if (parsed.data.whatsappOnLead !== undefined) update.whatsappOnLead = parsed.data.whatsappOnLead
  if (parsed.data.weeklyDigest   !== undefined) update.weeklyDigest   = parsed.data.weeklyDigest

  // Upsert — create the row if it doesn't exist yet
  const prefs = await prisma.notificationPrefs.upsert({
    where:  { userId: session.user.id },
    update,
    create: {
      userId:         session.user.id,
      emailOnLead:    parsed.data.emailOnLead    ?? true,
      whatsappOnLead: parsed.data.whatsappOnLead ?? true,
      weeklyDigest:   parsed.data.weeklyDigest   ?? true,
    },
  })

  return NextResponse.json({ prefs })
}
