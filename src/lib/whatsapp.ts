
import twilio from 'twilio'

// ─── Client (lazy init) ───────────────────────────────────────────────────────
let _client: twilio.Twilio | null = null

function getTwilio(): twilio.Twilio {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    throw new Error(
      'Twilio not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env.local\n' +
      'Get them free at twilio.com → Console → Account Info'
    )
  }
  if (!_client) {
    _client = twilio(sid, token)
  }
  return _client
}

const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL  ?? 'https://talrat.com'

// ─── Feature flag ─────────────────────────────────────────────────────────────
export const isWhatsAppConfigured = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN  &&
  process.env.TWILIO_WHATSAPP_FROM
)

// ─── Format phone number for WhatsApp ────────────────────────────────────────
function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  // Add country code for Indian numbers
  if (cleaned.length === 10) {
    return `whatsapp:+91${cleaned}`
  }
  // Already has country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `whatsapp:+${cleaned}`
  }
  return `whatsapp:+${cleaned}`
}

// ─── Send helper ──────────────────────────────────────────────────────────────
async function sendMessage(to: string, body: string): Promise<{
  success: boolean
  sid?: string
  error?: string
}> {
  try {
    const msg = await getTwilio().messages.create({
      from: FROM_NUMBER,
      to:   formatWhatsAppNumber(to),
      body,
    })
    return { success: true, sid: msg.sid }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown Twilio error'
    console.error('WhatsApp send failed:', msg)
    return { success: false, error: msg }
  }
}

// ─── 1. New lead notification ─────────────────────────────────────────────────
// Sent to talent immediately when someone submits the contact form
export async function sendLeadWhatsApp(data: {
  talentPhone:  string
  talentName:   string
  leadName:     string
  leadEmail:    string
  leadCompany?: string | null
  leadMessage:  string
  profileSlug:  string
}): Promise<{ success: boolean; sid?: string; error?: string }> {

  if (!isWhatsAppConfigured) {
    console.warn('⚠️  WhatsApp not configured — skipping lead notification')
    return { success: false, error: 'not_configured' }
  }

  const firstName   = data.talentName.split(' ')[0]
  const fromCompany = data.leadCompany ? ` from ${data.leadCompany}` : ''
  const profileUrl  = `${APP_URL}/${data.profileSlug}`

  const body = [
    `🎉 *New enquiry, ${firstName}!*`,
    ``,
    `*From:* ${data.leadName}${fromCompany}`,
    `*Email:* ${data.leadEmail}`,
    ``,
    `*Message:*`,
    data.leadMessage.length > 300
      ? data.leadMessage.slice(0, 300) + '...'
      : data.leadMessage,
    ``,
    `Reply directly: ${data.leadEmail}`,
    `View your profile: ${profileUrl}`,
    ``,
    `_Sent via talrat.com_`,
  ].join('\n')

  return sendMessage(data.talentPhone, body)
}

// ─── 2. Trial expiry reminder ─────────────────────────────────────────────────
// Sent by the daily cron job when trial is ending
export async function sendTrialExpiryWhatsApp(data: {
  phone:      string
  name:       string
  daysLeft:   number
  profileUrl: string
}): Promise<{ success: boolean; sid?: string; error?: string }> {

  if (!isWhatsAppConfigured) {
    return { success: false, error: 'not_configured' }
  }

  const firstName  = data.name.split(' ')[0]
  const urgentFlag = data.daysLeft <= 1 ? '🚨' : data.daysLeft <= 3 ? '⚠️' : '📅'
  const dayText    = data.daysLeft === 1 ? 'tomorrow' : `in ${data.daysLeft} days`

  const body = [
    `${urgentFlag} *talrat trial ending ${dayText}, ${firstName}*`,
    ``,
    `Your profile at ${data.profileUrl} will go offline when your trial ends.`,
    ``,
    `Upgrade to PRO for ₹499/month to:`,
    `✓ Keep your profile live`,
    `✓ Continue receiving WhatsApp alerts`,
    `✓ Access your analytics`,
    ``,
    `Upgrade now: ${APP_URL}/dashboard/billing`,
    ``,
    `_talrat.com — your professional rate card_`,
  ].join('\n')

  return sendMessage(data.phone, body)
}

// ─── 3. View notification (optional, disabled by default) ─────────────────────
// Sent when someone views the profile — can be noisy, off by default
export async function sendProfileViewWhatsApp(data: {
  phone:      string
  name:       string
  profileUrl: string
  source?:    string | null
}): Promise<{ success: boolean; sid?: string; error?: string }> {

  if (!isWhatsAppConfigured) {
    return { success: false, error: 'not_configured' }
  }

  const firstName = data.name.split(' ')[0]
  const source    = data.source ? ` from *${data.source}*` : ''

  const body = [
    `👀 *${firstName}, someone viewed your talrat profile${source}*`,
    ``,
    data.profileUrl,
    ``,
    `_talrat.com_`,
  ].join('\n')

  return sendMessage(data.phone, body)
}

// ─── 4. Sandbox join instructions (for testing) ───────────────────────────────
// Before production, users must join the Twilio sandbox
export function getSandboxJoinInstructions(phone: string): string {
  return [
    `To receive WhatsApp notifications, send this message from ${phone}:`,
    ``,
    `"join <your-sandbox-keyword>"`,
    ``,
    `To the number: +1 415 523 8886`,
    ``,
    `Get your sandbox keyword at:`,
    `twilio.com → Messaging → Try it out → Send a WhatsApp message`,
  ].join('\n')
}
