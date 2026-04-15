import type {
  User,
  Profile,
  Subscription,
  WorkSample,
  Skill,
  Lead,
  SupportTicket,
  TicketMessage,
  NotificationPrefs,
} from '@prisma/client'

// Extended types with relations
export type UserWithProfile = User & {
  profile: Profile | null
  subscription: Subscription | null
}

export type ProfileWithRelations = Profile & {
  workSamples: WorkSample[]
  skills: Skill[]
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>
}

export type ProfileWithAll = Profile & {
  workSamples: WorkSample[]
  skills: Skill[]
  user: Pick<User, 'id' | 'name' | 'email' | 'image' | 'phone'>
}

export type LeadWithProfile = Lead & {
  profile: Pick<Profile, 'displayName' | 'slug'>
}

export type TicketWithMessages = SupportTicket & {
  messages: TicketMessage[]
  user: Pick<User, 'id' | 'name' | 'email'>
}

export type UserWithAll = User & {
  profile: Profile | null
  subscription: Subscription | null
  tickets: SupportTicket[]
  notifications: NotificationPrefs | null
}

// Dashboard types
export type DashboardData = {
  user: UserWithAll
  profile: ProfileWithAll | null
  analytics: {
    totalViews: number
    totalLeads: number
    viewsThisMonth: number
    leadsThisMonth: number
    topSources: { source: string; count: number }[]
    topLocations: { location: string; count: number }[]
    viewsChart: { date: string; views: number }[]
  }
}

// API response types 

export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

//  Form types
export type ProfileFormData = {
  talentType: string
  displayName: string
  slug: string
  headline: string
  bio: string
  location: string
  experience: number
  availability: string
  tier1Label: string
  tier1Price: number
  tier1Desc: string
  tier2Label: string
  tier2Price: number
  tier2Desc: string
  tier2Popular: boolean
  tier3Label: string
  tier3Price: number
  tier3Desc: string
  websiteUrl: string
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  instagramUrl: string
  youtubeUrl: string
  dribbbleUrl: string
  behanceUrl: string
  skills: string[]
  workSamples: { title: string; url: string; description?: string }[]
}

export type ContactFormData = {
  name: string
  email: string
  company?: string
  message: string
  phone?: string
}

// Admin types
export type AdminMetrics = {
  totalUsers: number
  activeUsers: number
  paidUsers: number
  trialUsers: number
  mrr: number
  arr: number
  churnRate: number
  ltv: number
  cac: number
  nrr: number
  ruleOf40: number
  ltvCacRatio: number
  paybackPeriod: number
  growthChart: { month: string; users: number; paid: number }[]
  mrrChart: { month: string; mrr: number }[]
}

//  Notification types 
export type EmailNotificationPayload = {
  to: string
  talentName: string
  leadName: string
  leadEmail: string
  leadCompany?: string
  message: string
  profileUrl: string
}

export type WhatsAppNotificationPayload = {
  to: string
  talentName: string
  leadName: string
  leadEmail: string
  message: string
  profileUrl: string
}
