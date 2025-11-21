import { supabase } from './supabaseClient'
import type { OrgPost } from '@/types'

export async function createOrgAnnouncement(input: {
  organization_id: string
  author_profile_id: string
  title: string
  body?: string
  post_type?: string | null
  demographic?: string | null
  recurs_on_days?: number[] | null // Array of day numbers 1-7
  start_time?: string | null // HH:MM format
  end_time?: string | null // HH:MM format
  date?: string | null // YYYY-MM-DD format
}): Promise<{ ok: boolean; data?: OrgPost; error?: string }> {
  try {
    const payload = {
      organization_id: input.organization_id,
      author_profile_id: input.author_profile_id,
      title: input.title,
      body: input.body ?? null,
      send_push: true, // Default to true as per your schema
      post_type: input.post_type ?? null,
      demographic: input.demographic ?? null,
      recurs_on_days: input.recurs_on_days ?? null,
      start_time: input.start_time ?? null,
      end_time: input.end_time ?? null,
      date: input.date ?? null,
    }
    const { data, error } = await supabase
      .from('org_posts')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return { ok: true, data: data as OrgPost }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown-error'
    console.error('[createOrgAnnouncement] error', e)
    return { ok: false, error: message }
  }
}
