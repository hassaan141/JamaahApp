import { supabase } from './supabaseClient'

export async function deleteOrgAnnouncement(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('org_posts').delete().eq('id', id)

    if (error) throw error
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown-error'
    console.error('[deleteOrgAnnouncement] error', e)
    return { ok: false, error: message }
  }
}
