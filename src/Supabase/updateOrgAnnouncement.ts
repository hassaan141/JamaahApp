import { supabase } from './supabaseClient'
import type { OrgPost, Database } from '@/types'

export async function updateOrgAnnouncement(
  id: string,
  updates: Database['public']['Tables']['org_posts']['Update'],
): Promise<{ ok: boolean; data?: OrgPost; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('org_posts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { ok: true, data: data as OrgPost }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown-error'
    console.error('[updateOrgAnnouncement] error', e)
    return { ok: false, error: message }
  }
}
