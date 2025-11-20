import { supabase } from './supabaseClient'
import type { OrgPost } from '@/types'

export async function createOrgAnnouncement(input: {
  organization_id: string
  author_profile_id: string
  title: string
  body?: string
  send_push?: boolean
  post_type?: string | null
  demographic?: string | null
  start_time?: string | null // ISO / timestampz
  end_time?: string | null
}): Promise<{ ok: boolean; data?: OrgPost; error?: string }> {
  try {
    const payload = {
      organization_id: input.organization_id,
      author_profile_id: input.author_profile_id,
      title: input.title,
      body: input.body ?? null,
      send_push: input.send_push ?? false,
      post_type: input.post_type ?? null,
      demographic: input.demographic ?? null,
      start_time: input.start_time ?? null,
      end_time: input.end_time ?? null,
      // type or send_push handling can be added later if needed
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
