// src/lib/email.ts
// Resend email service — all transactional emails for talrat.com
// Templates: new lead notification, magic link (handled by NextAuth),
// trial expiry reminder, welcome email

import { Resend } from 'resend'

// ─── Client (lazy init) ───────────────────────────────────────────────────────
let _resend: Resend | null = null

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY is not set. Get it from resend.com → API Keys'
    )
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'talrat@resend.dev'
const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'talrat'
const FROM_ADDRESS = `${FROM_NAME} <${FROM}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'

// ─── Feature flag ─────────────────────────────────────────────────────────────
export const isEmailConfigured = !!process.env.RESEND_API_KEY

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LeadNotificationData {
  talentEmail:   string
  talentName:    string
  talentPhone?:  string | null
  leadName:      string
  leadEmail:     string
  leadCompany?:  string | null
  leadMessage:   string
  profileSlug:   string
  profileUrl:    string
}

export interface TrialReminderData {
  userEmail:  string
  userName:   string
  daysLeft:   number
  profileUrl: string
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────
function emailWrapper(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${previewText ? `<meta name="description" content="${previewText}" />` : ''}
  <title>Talrat</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <a href="${APP_URL}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;color:#0a66c2;letter-spacing:-0.5px;">talrat</span>
                <span style="font-size:14px;color:#94a3b8;">.com</span>
              </a>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Sent by <a href="${APP_URL}" style="color:#0a66c2;text-decoration:none;">talrat.com</a>
                — your professional rate card platform
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#cbd5e1;">
                
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function divider(): string {
  return '<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />'
}

function button(text: string, url: string, primary = true): string {
  const bg = primary ? '#0a66c2' : '#f8fafc'
  const color = primary ? '#ffffff' : '#334155'
  const border = primary ? '#0a66c2' : '#e2e8f0'
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:${bg};border-radius:10px;border:1px solid ${border};">
          <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:${color};text-decoration:none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

// ─── 1. New lead notification ─────────────────────────────────────────────────
export async function sendLeadNotification(data: LeadNotificationData) {
  if (!isEmailConfigured) {
    console.warn('⚠️  Email not configured — skipping lead notification email')
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

    <!-- Lead info box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;margin:0 0 24px 0;">
      <tr>
        <td>
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">From</p>
          <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:#0f172a;">
            ${data.leadName}
            ${data.leadCompany ? `<span style="font-size:13px;font-weight:400;color:#64748b;"> at ${data.leadCompany}</span>` : ''}
          </p>

          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
          <p style="margin:0 0 16px 0;">
            <a href="mailto:${data.leadEmail}" style="font-size:14px;color:#0a66c2;text-decoration:none;">${data.leadEmail}</a>
          </p>

          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;padding:12px 16px;">
            ${data.leadMessage.replace(/\n/g, '<br/>')}
          </p>
        </td>
      </tr>
    </table>

    ${button(`Reply to ${data.leadName}`, `mailto:${data.leadEmail}`)}
    ${divider()}

    <p style="margin:0;font-size:13px;color:#94a3b8;">
      This enquiry came through your talrat profile at
      <a href="${data.profileUrl}" style="color:#0a66c2;text-decoration:none;">${data.profileUrl}</a>
    </p>
  `, `New enquiry from ${data.leadName}`)

  try {
    const { data: result, error } = await getResend().emails.send({
      from:    FROM_ADDRESS,
      to:      data.talentEmail,
      subject,
      html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send lead notification email:', error)
    return { success: false, error }
  }
}

// ─── 2. Trial expiry reminder ──────────────────────────────────────────────────
export async function sendTrialExpiryReminder(data: TrialReminderData) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName  = data.userName.split(' ')[0]
  const isUrgent   = data.daysLeft <= 3
  const subject    = isUrgent
    ? `⚠️ Your talrat trial ends in ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'}`
    : `Your talrat trial ends in ${data.daysLeft} days`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      ${isUrgent ? '⚠️ ' : ''}Your trial ends in ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'}, ${firstName}
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      After your trial ends, your profile at
      <a href="${data.profileUrl}" style="color:#0a66c2;">${data.profileUrl}</a>
      will be taken offline. Upgrade to PRO to keep it live.
    </p>

    <!-- What you keep -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;padding:20px;margin:0 0 24px 0;">
      <tr>
        <td>
          <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;color:#1e40af;">With talrat PRO — ₹499/month:</p>
          ${['Profile stays live on talrat.com', 'WhatsApp notifications for every lead', 'Analytics dashboard', 'Unlimited leads'].map(f =>
            `<p style="margin:0 0 6px 0;font-size:13px;color:#1e3a8a;">✓ ${f}</p>`
          ).join('')}
        </td>
      </tr>
    </table>

    ${button('Upgrade to PRO — ₹499/mo', `${APP_URL}/dashboard/billing`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Questions? Reply to this email and we will help you out.
    </p>
  `, subject)

  try {
    const { data: result, error } = await getResend().emails.send({
      from:    FROM_ADDRESS,
      to:      data.userEmail,
      subject,
      html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send trial reminder email:', error)
    return { success: false, error }
  }
}

// ─── 3. Welcome email (sent after first sign up) ───────────────────────────────
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName = userName.split(' ')[0]
  const subject   = `Welcome to talrat, ${firstName}! Your rate card awaits 🚀`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      Welcome to talrat, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      You have a 30-day free trial to build your rate card page.
      Here is how to get started in 5 minutes:
    </p>

    ${[
      { n: '1', title: 'Pick your talent type', desc: 'Choose from 22 categories — designer, developer, consultant, and more.' },
      { n: '2', title: 'Set your rates', desc: 'Three engagement tiers. Pre-filled with typical rates for your type.' },
      { n: '3', title: 'Add your skills and links', desc: 'Skills, portfolio links, social profiles.' },
      { n: '4', title: 'Publish and share', desc: 'Your profile goes live at talrat.com/yourname instantly.' },
    ].map(step => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td width="36" valign="top">
            <div style="width:28px;height:28px;background:#0a66c2;border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:12px;font-weight:700;color:#ffffff;">${step.n}</span>
            </div>
          </td>
          <td valign="top" style="padding-left:12px;">
            <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:#0f172a;">${step.title}</p>
            <p style="margin:0;font-size:13px;color:#64748b;">${step.desc}</p>
          </td>
        </tr>
      </table>
    `).join('')}

    ${button('Build your rate card now', `${APP_URL}/dashboard/profile`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Need help? Just reply to this email. We read every message.
    </p>
  `, `Welcome! Your 30-day free trial has started.`)

  try {
    const { data: result, error } = await getResend().emails.send({
      from:    FROM_ADDRESS,
      to:      userEmail,
      subject,
      html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

// ─── 4. Lead confirmation to the person who enquired ──────────────────────────
export async function sendLeadConfirmation(data: {
  leadEmail:   string
  leadName:    string
  talentName:  string
  profileUrl:  string
}) {
  if (!isEmailConfigured) return { success: false, reason: 'not_configured' }

  const firstName = data.leadName.split(' ')[0]
  const subject   = `Your message to ${data.talentName} was sent`

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,serif;">
      Message sent, ${firstName}!
    </h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;">
      Your message to <strong>${data.talentName}</strong> was delivered.
      They typically respond within 24 hours.
    </p>
    ${button(`View ${data.talentName}'s profile`, data.profileUrl, false)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      This confirmation was sent because you contacted someone through
      <a href="${APP_URL}" style="color:#0a66c2;text-decoration:none;">talrat.com</a>
    </p>
  `)

  try {
    const { data: result, error } = await getResend().emails.send({
      from:    FROM_ADDRESS,
      to:      data.leadEmail,
      subject,
      html,
    })
    if (error) throw error
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Failed to send lead confirmation email:', error)
    return { success: false, error }
  }
}
