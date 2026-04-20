// Works regardless of what the NotificationPrefs relation is called in schema.prisma

import { NextResponse }    from 'next/server'
import { prisma }          from '@/lib/prisma'
import {
  getContactFormLimiter,
  getClientIP,
  rateLimitResponse,
  isRedisConfigured,
}                          from '@/lib/redis'
import {
  sendLeadNotification,
  sendLeadConfirmation,
  isEmailConfigured,
}                          from '@/lib/email'
import {
  sendLeadWhatsApp,
  isWhatsAppConfigured,
}                          from '@/lib/whatsapp'
import { z }               from 'zod'

// ─── Validation ───────────────────────────────────────────────────────────────
const contactSchema = z.object({
  profileSlug: z.string().min(1),
  name:        z.string().min(2).max(80),
  email:       z.string().email(),
  company:     z.string().max(80).optional(),
  message:     z.string().min(10).max(1000),
  phone:       z.string().max(20).optional(),
})

export async function POST(request: Request) {
  const ip = getClientIP(request)

  // ── Rate limit ─────────────────────────────────────────────────────────────
  if (isRedisConfigured) {
    try {
      const limiter = getContactFormLimiter()
      const { success, reset } = await limiter.limit(ip)
      if (!success) return rateLimitResponse(reset)
    } catch { /* non-fatal */ }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { profileSlug, name, email, company, message } = parsed.data

  // ── Query 1: profile + user (no include of NotificationPrefs) ─────────────
  const profile = await prisma.profile.findUnique({
    where:   { slug: profileSlug, isPublished: true },
    include: {
      user: {
        select: {
          id:    true,
          name:  true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const talent  = profile.user
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'
  const profileUrl = `${appUrl}/${profileSlug}`

  // ── Query 2: notification prefs — separate query, no relation typing issue ─
  // Using findFirst with userId filter — works with any schema
  const prefs = await prisma.notificationPrefs.findFirst({
    where:  { userId: talent.id },
    select: { emailOnLead: true, whatsappOnLead: true },
  })

  // Default to TRUE if no prefs row exists yet
  const sendEmail    = (prefs?.emailOnLead    ?? true) && isEmailConfigured
  const sendWhatsApp = (prefs?.whatsappOnLead ?? true) && isWhatsAppConfigured && !!talent.phone

  // ── Save lead ──────────────────────────────────────────────────────────────
  const lead = await prisma.lead.create({
    data: {
      profileId: profile.id,
      name,
      email,
      company:  company || null,
      message,
      source: (() => {
        try {
          const ref = request.headers.get('referer')
          return ref ? new URL(ref).hostname : null
        } catch { return null }
      })(),
      notified: false,
    },
  })

  // Increment lead counter
  await prisma.profile.update({
    where: { id: profile.id },
    data:  { totalLeads: { increment: 1 } },
  })

  // ── Debug log — check your terminal to see what's happening ──────────────
  console.log('📬 Lead received:', {
    from:          name,
    profileSlug,
    talentPhone:   talent.phone,
    talentEmail:   talent.email,
    sendEmail,
    sendWhatsApp,
    isWhatsAppConfigured,
    isEmailConfigured,
    prefs,
  })

  // ── Send notifications (parallel, non-blocking) ────────────────────────────
  const tasks: Promise<any>[] = []

  if (sendWhatsApp && talent.phone) {
    console.log('📱 Sending WhatsApp to:', talent.phone)
    tasks.push(
      sendLeadWhatsApp({
        talentPhone:  talent.phone,
        talentName:   talent.name ?? 'there',
        leadName:     name,
        leadEmail:    email,
        leadCompany:  company,
        leadMessage:  message,
        profileSlug,
      }).then(result => {
        console.log('📱 WhatsApp result:', result)
        if (result.success) {
          return prisma.lead.update({
            where: { id: lead.id },
            data:  { notified: true },
          })
        }
      })
    )
  }

  if (sendEmail && talent.email) {
    console.log('📧 Sending email to:', talent.email)
    tasks.push(
      sendLeadNotification({
        talentEmail:  talent.email,
        talentName:   talent.name ?? 'there',
        talentPhone:  talent.phone,
        leadName:     name,
        leadEmail:    email,
        leadCompany:  company,
        leadMessage:  message,
        profileSlug,
        profileUrl,
      }).then(r => console.log('📧 Email result:', r))
    )
  }

  if (isEmailConfigured) {
    tasks.push(
      sendLeadConfirmation({
        leadEmail:  email,
        leadName:   name,
        talentName: talent.name ?? profile.displayName,
        profileUrl,
      })
    )
  }

  Promise.allSettled(tasks).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`❌ Notification ${i} failed:`, r.reason)
      }
    })
  })

  return NextResponse.json({
    success: true,
    leadId:  lead.id,
    message: `Message sent to ${talent.name ?? profile.displayName}.`,
  })
}
