
import { z } from 'zod'

// ─── Schema 
const envSchema = z.object({

  // ── Node 
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // ── Database (Supabase)
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required — get it from Supabase → Project Settings → Database → Connection string (Transaction mode, port 6543)' })
    .url('DATABASE_URL must be a valid PostgreSQL URL')
    .refine(
      (url) => url.includes('supabase') || url.includes('postgresql') || url.includes('postgres'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),

  DIRECT_URL: z
    .string({ required_error: 'DIRECT_URL is required — get it from Supabase → Project Settings → Database → Connection string (Session mode, port 5432)' })
    .url('DIRECT_URL must be a valid PostgreSQL URL'),

  // ── Auth 
  AUTH_SECRET: z
    .string({ required_error: 'AUTH_SECRET is required — generate with: openssl rand -base64 32' })
    .min(32, 'AUTH_SECRET must be at least 32 characters long'),

  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .default('http://localhost:3000'),

  // ── Google OAuth (optional in development) 
  GOOGLE_CLIENT_ID: z
    .string()
    .optional(),

  GOOGLE_CLIENT_SECRET: z
    .string()
    .optional(),

  // ── Resend (email) 
  RESEND_API_KEY: z
    .string()
    .optional(),

  RESEND_FROM_EMAIL: z
    .string()
    .email('RESEND_FROM_EMAIL must be a valid email')
    .default('onboarding@resend.dev'),

  RESEND_FROM_NAME: z
    .string()
    .default('talrat'),

  // ── Upstash Redis 
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url('UPSTASH_REDIS_REST_URL must be a valid URL')
    .optional(),

  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .optional(),

  // ── Twilio (WhatsApp) 
  TWILIO_ACCOUNT_SID: z
    .string()
    .optional(),

  TWILIO_AUTH_TOKEN: z
    .string()
    .optional(),

  TWILIO_WHATSAPP_FROM: z
    .string()
    .optional(),

  // ── Razorpay
  RAZORPAY_KEY_ID: z
    .string()
    .optional(),

  RAZORPAY_KEY_SECRET: z
    .string()
    .optional(),

  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .optional(),

  // ── Public vars
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  NEXT_PUBLIC_APP_NAME: z
    .string()
    .default('talrat'),

  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .optional(),

  NEXT_PUBLIC_PRO_PRICE_INR: z
    .string()
    .default('499'),

  // ── Cron 
  CRON_SECRET: z
    .string()
    .optional(),

  // ── Admin
  SUPER_ADMIN_EMAIL: z
    .string()
    .email('SUPER_ADMIN_EMAIL must be a valid email')
    .optional(),
})

// ─── Parse and validate 
function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('\n❌ Invalid environment variables:\n')
    result.error.issues.forEach((issue) => {
      console.error(`  ✗ ${issue.path.join('.')}: ${issue.message}`)
    })
    console.error('\n📋 Check your .env.local file and add the missing variables.\n')
    throw new Error('Invalid environment variables — see above for details')
  }

  return result.data
}

// ─── Exported env object 
// Use this instead of process.env directly — it is type-safe and validated
export const env = validateEnv()

// ─── Feature flags (derived from env) 
export const features = {
  // True only when real Google keys are set
  googleAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),

  // True only when Resend key is set (not the default onboarding address)
  emailNotifications: !!(env.RESEND_API_KEY),

  // True only when Twilio is configured
  whatsappNotifications: !!(
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_WHATSAPP_FROM
  ),

  // True only when Redis is configured
  redisCache: !!(
    env.UPSTASH_REDIS_REST_URL &&
    env.UPSTASH_REDIS_REST_TOKEN
  ),

  // True only when Razorpay is configured
  payments: !!(
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET
  ),

  // True in production
  isProduction: env.NODE_ENV === 'production',
}

// ─── Type export 
export type Env = z.infer<typeof envSchema>
