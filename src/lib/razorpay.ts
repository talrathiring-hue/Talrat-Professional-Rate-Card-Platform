// ─── Razorpay Integration ─────────────────────────────────────────────────────
// Status: PLACEHOLDER — follow the 4 steps below to activate real payments
//
// Step 1: Add these to your .env.local:
//   RAZORPAY_KEY_ID=rzp_live_...
//   RAZORPAY_KEY_SECRET=...
//   RAZORPAY_WEBHOOK_SECRET=...
//   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
//
// Step 2: Install Razorpay SDK: npm install razorpay
//
// Step 3: Uncomment the real implementation below
//
// Step 4: In src/app/layout.tsx, add before </body>:
//   <script src="https://checkout.razorpay.com/v1/checkout.js" />

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateOrderParams {
  amount: number   // in INR paise
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export interface VerifyPaymentParams {
  orderId: string
  paymentId: string
  signature: string
}

// ─── Placeholder implementation ───────────────────────────────────────────────
// Replace with real Razorpay implementation when you have API keys

export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  // PLACEHOLDER — returns a mock order for development
  // TO ACTIVATE: uncomment the real implementation below

  console.warn('⚠️  Razorpay placeholder active — using mock order')
  return {
    id: `order_mock_${Date.now()}`,
    amount: params.amount,
    currency: params.currency ?? 'INR',
    receipt: params.receipt ?? 'receipt_' + Date.now(),
    status: 'created',
  }

  /* REAL IMPLEMENTATION — uncomment when ready:
  const Razorpay = (await import('razorpay')).default
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency ?? 'INR',
    receipt: params.receipt ?? 'receipt_' + Date.now(),
    notes: params.notes,
  })
  return order as RazorpayOrder
  */
}

export function verifyPayment(params: VerifyPaymentParams): boolean {
  // PLACEHOLDER — always returns true in dev
  // TO ACTIVATE: uncomment the real implementation below

  console.warn('⚠️  Razorpay signature verification skipped (placeholder)')
  return true

  /* REAL IMPLEMENTATION — uncomment when ready:
  const crypto = await import('crypto')
  const body = params.orderId + '|' + params.paymentId
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expected === params.signature
  */
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  // PLACEHOLDER
  return true

  /* REAL IMPLEMENTATION:
  const crypto = await import('crypto')
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expected === signature
  */
}

// ─── Constants ─────────────────────────────────────────────────────────────────
export const PRO_PLAN_PRICE_PAISE = 49900  // ₹499/month
export const PRO_PLAN_PRICE_INR = 499
export const TRIAL_DAYS = 30
