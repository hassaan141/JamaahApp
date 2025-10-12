import { supabase } from './supabaseClient'
import type { OrgPost } from '@/types'

export async function createOrgAnnouncement(input: {
  organization_id: string
  author_profile_id: string
  title: string
  body?: string
  send_push?: boolean
}): Promise<{ ok: boolean; data?: OrgPost; error?: string }> {
  try {
    const payload = {
      organization_id: input.organization_id,
      author_profile_id: input.author_profile_id,
      title: input.title,
      body: input.body ?? null,
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
