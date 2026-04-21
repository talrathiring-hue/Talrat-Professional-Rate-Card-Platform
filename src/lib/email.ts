import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set — get it from resend.com → API Keys')
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// FIXED: default to onboarding@resend.dev (Resend's shared domain — works without verification)
// Your .env.local had RESEND_FROM_EMAIL=talrat@resend.dev which does not exist
const FROM          = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const FROM_NAME     = process.env.RESEND_FROM_NAME  ?? 'talrat'
const FROM_ADDRESS  = `${FROM_NAME} <${FROM}>`
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'

export const isEmailConfigured = !!process.env.RESEND_API_KEY

export interface LeadNotificationData {
  talentEmail:  string
  talentName:   string
  talentPhone?: string | null
  leadName:     string
  leadEmail:    string
  leadCompany?: string | null
  leadMessage:  string
  profileSlug:  string
  profileUrl:   string
}

export interface TrialReminderData {
  userEmail:  string
  userName:   string
  daysLeft:   number
  profileUrl: string
}

function emailWrapper(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${previewText ? `<meta name="description" content="${previewText}" />` : ''}
  <title>talrat</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 24px 0;">
          <a href="${APP_URL}" style="text-decoration:none;">
            <span style="font-size:22px;font-weight:700;color:#0a66c2;">talrat</span>
            <span style="font-size:14px;color:#94a3b8;">.com</span>
          </a>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:32px;">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 0 0 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            Sent by <a href="${APP_URL}" style="color:#0a66c2;text-decoration:none;">talrat.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function divider(): string {
  return '<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />'
}

function button(text: string, url: string, primary = true): string {
  const bg     = primary ? '#0a66c2' : '#f8fafc'
  const color  = primary ? '#ffffff' : '#334155'
  const border = primary ? '#0a66c2' : '#e2e8f0'
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:${bg};border-radius:10px;border:1px solid ${border};">
        <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:${color};text-decoration:none;">${text}</a>
      </td></tr>
    </table>`
}

export async function sendLeadNotification(data: LeadNotificationData) {
  if (!isEmailConfigured) {
    console.warn('⚠️  Email not configured — skipping lead notification')
    return { success: false, reason: 'not_configured' }
  }

  const firstName = data.talentName.split(' ')[0]
  const subject   = `New enquiry from ${data.leadName}${data.leadCompany ? ` at ${data.leadCompany}` : ''}`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      New enquiry, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      Someone just contacted you through your talrat profile.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;margin:0 0 24px 0;">
      <tr><td>
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">From</p>
        <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:#0f172a;">
          ${data.leadName}${data.leadCompany ? `<span style="font-size:13px;font-weight:400;color:#64748b;"> at ${data.leadCompany}</span>` : ''}
        </p>
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Email</p>
        <p style="margin:0 0 16px 0;">
          <a href="mailto:${data.leadEmail}" style="font-size:14px;color:#0a66c2;text-decoration:none;">${data.leadEmail}</a>
        </p>
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Message</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;padding:12px 16px;">
          ${data.leadMessage.replace(/\n/g, '<br/>')}
        </p>
      </td></tr>
    </table>
    ${button(`Reply to ${data.leadName}`, `mailto:${data.leadEmail}`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Via your talrat profile: <a href="${data.profileUrl}" style="color:#0a66c2;">${data.profileUrl}</a>
    </p>
  `, `New enquiry from ${data.leadName}`)

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_ADDRESS, to: data.talentEmail, subject, html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send lead notification email:', error)
    return { success: false, error }
  }
}

export async function sendTrialExpiryReminder(data: TrialReminderData) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName = data.userName.split(' ')[0]
  const isUrgent  = data.daysLeft <= 3
  const subject   = isUrgent
    ? `⚠️ Your talrat trial ends in ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'}`
    : `Your talrat trial ends in ${data.daysLeft} days`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      ${isUrgent ? '⚠️ ' : ''}Your trial ends in ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'}, ${firstName}
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      After your trial, your profile at <a href="${data.profileUrl}" style="color:#0a66c2;">${data.profileUrl}</a> will go offline.
    </p>
    ${button('Upgrade to PRO — ₹499/mo', `${APP_URL}/dashboard/billing`)}
  `, subject)

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_ADDRESS, to: data.userEmail, subject, html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send trial reminder:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName = userName.split(' ')[0]
  const subject   = `Welcome to talrat, ${firstName}! 🚀`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      Welcome to talrat, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      You have a 30-day free trial. Build your rate card in 5 minutes:
    </p>
    ${button('Build your rate card now', `${APP_URL}/dashboard/profile`)}
  `, `Welcome! Your 30-day trial has started.`)

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_ADDRESS, to: userEmail, subject, html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendLeadConfirmation(data: {
  leadEmail:  string
  leadName:   string
  talentName: string
  profileUrl: string
}) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName = data.leadName.split(' ')[0]
  const subject   = `Your message to ${data.talentName} was sent`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      Message sent, ${firstName}!
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      Your message to <strong>${data.talentName}</strong> was delivered. They typically respond within 24 hours.
    </p>
    ${button(`View ${data.talentName}'s profile`, data.profileUrl, false)}
  `)

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_ADDRESS, to: data.leadEmail, subject, html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send lead confirmation:', error)
    return { success: false, error }
  }
}
