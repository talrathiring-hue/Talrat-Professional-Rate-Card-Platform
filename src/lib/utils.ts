import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import slugify from 'slugify'

//  Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//  Currency formatting 
export function formatINR(paise: number, compact = false): string {
  const rupees = paise / 100
  if (compact) {
    if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`
    if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

export function paiseToRupees(paise: number): number {
  return paise / 100
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

//  Slug generation 
export function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  })
}

//  Date formatting 
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, h:mm a')
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

//  Talent type labels 
export const TALENT_TYPE_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEER: 'Software Engineer',
  FRONTEND_DEVELOPER: 'Frontend Developer',
  BACKEND_DEVELOPER: 'Backend Developer',
  FULLSTACK_DEVELOPER: 'Fullstack Developer',
  MOBILE_DEVELOPER: 'Mobile Developer',
  DATA_SCIENTIST: 'Data Scientist',
  ML_ENGINEER: 'ML Engineer',
  DEVOPS_ENGINEER: 'DevOps Engineer',
  UI_UX_DESIGNER: 'UI/UX Designer',
  GRAPHIC_DESIGNER: 'Graphic Designer',
  MOTION_DESIGNER: 'Motion Designer',
  VIDEO_EDITOR: 'Video Editor',
  CONTENT_WRITER: 'Content Writer',
  COPYWRITER: 'Copywriter',
  SEO_SPECIALIST: 'SEO Specialist',
  SOCIAL_MEDIA_MANAGER: 'Social Media Manager',
  PRODUCT_MANAGER: 'Product Manager',
  BUSINESS_ANALYST: 'Business Analyst',
  FINANCIAL_CONSULTANT: 'Financial Consultant',
  LEGAL_CONSULTANT: 'Legal Consultant',
  MARKETING_CONSULTANT: 'Marketing Consultant',
  PHOTOGRAPHER: 'Photographer',
}

export const TALENT_TYPE_EMOJIS: Record<string, string> = {
  SOFTWARE_ENGINEER: '💻',
  FRONTEND_DEVELOPER: '🎨',
  BACKEND_DEVELOPER: '⚙️',
  FULLSTACK_DEVELOPER: '🚀',
  MOBILE_DEVELOPER: '📱',
  DATA_SCIENTIST: '📊',
  ML_ENGINEER: '🤖',
  DEVOPS_ENGINEER: '🛠️',
  UI_UX_DESIGNER: '✏️',
  GRAPHIC_DESIGNER: '🖼️',
  MOTION_DESIGNER: '🎬',
  VIDEO_EDITOR: '🎥',
  CONTENT_WRITER: '✍️',
  COPYWRITER: '📝',
  SEO_SPECIALIST: '🔍',
  SOCIAL_MEDIA_MANAGER: '📲',
  PRODUCT_MANAGER: '📋',
  BUSINESS_ANALYST: '📈',
  FINANCIAL_CONSULTANT: '💰',
  LEGAL_CONSULTANT: '⚖️',
  MARKETING_CONSULTANT: '📣',
  PHOTOGRAPHER: '📷',
}

//  Availability labels 
export const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available for work', color: 'text-success-600 bg-success-50' },
  BUSY: { label: 'Limited availability', color: 'text-warning-600 bg-warning-50' },
  UNAVAILABLE: { label: 'Not available', color: 'text-danger-600 bg-danger-50' },
}

//  Plan helpers 
export function isPro(status: string): boolean {
  return status === 'ACTIVE'
}

export function isTrialExpired(trialEndsAt: Date | null | undefined): boolean {
  if (!trialEndsAt) return false
  return new Date() > new Date(trialEndsAt)
}

export function trialDaysLeft(trialEndsAt: Date | null | undefined): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

//  String helpers 
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length - 3) + '...'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

//  URL helpers 
export function profileUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'
  return `${base}/${slug}`
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talrat.com'
  return `${base}${path}`
}

//  Validation 
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,50}$/.test(slug)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ''))
}

//  Number formatting 
export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}
