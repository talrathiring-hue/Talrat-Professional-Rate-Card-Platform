'use client'
import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProfileData {
  id:           string
  slug:         string
  isPublished:  boolean
  talentType:   string
  displayName:  string
  headline:     string | null
  bio:          string | null
  location:     string | null
  experience:   number | null
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
  adaptiveData: Record<string, unknown>

  tier1Label:   string | null
  tier1Price:   number | null   // stored as paise in DB
  tier1Desc:    string | null
  tier2Label:   string | null
  tier2Price:   number | null
  tier2Desc:    string | null
  tier2Popular: boolean
  tier3Label:   string | null
  tier3Price:   number | null
  tier3Desc:    string | null

  websiteUrl:   string | null
  linkedinUrl:  string | null
  twitterUrl:   string | null
  githubUrl:    string | null
  instagramUrl: string | null
  youtubeUrl:   string | null
  dribbbleUrl:  string | null
  behanceUrl:   string | null

  skills:      { id: string; name: string; order: number }[]
  workSamples: { id: string; title: string; url: string; description?: string; order: number }[]
  totalViews:  number
  totalLeads:  number
}

// ─── useProfile ───────────────────────────────────────────────────────────────
export function useProfile() {
  const [profile, setProfile]   = useState<ProfileData | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)

  // Fetch the current user's profile
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch profile')
      setProfile(data.profile)
      return data.profile as ProfileData | null
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching profile')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new profile
  const createProfile = useCallback(async (data: Partial<ProfileData> & {
    skills?: { name: string }[]
    workSamples?: { title: string; url: string; description?: string }[]
  }) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to create profile')
      setProfile(result.profile)
      return result.profile as ProfileData
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error creating profile'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [])

  // Update existing profile
  const updateProfile = useCallback(async (data: Partial<ProfileData> & {
    skills?: { name: string }[]
    workSamples?: { title: string; url: string; description?: string }[]
  }) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to update profile')
      setProfile(result.profile)
      return result.profile as ProfileData
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error updating profile'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [])

  // Check slug availability
  const checkSlug = useCallback(async (slug: string): Promise<{
    available: boolean
    slug: string
    reason?: string
  }> => {
    const res = await fetch(`/api/profile/slug?slug=${encodeURIComponent(slug)}`)
    return res.json()
  }, [])

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    checkSlug,
  }
}
