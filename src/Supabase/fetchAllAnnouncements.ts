import { supabase } from './supabaseClient'
import type { OrgPost } from '@/types'

export async function fetchAnnouncements(
  opts: { limit?: number } = {},
): Promise<OrgPost[]> {
  try {
    const { limit = 50 } = opts
    const { data, error } = await supabase
      .from('org_posts')
      .select('*, organizations(name)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    console.log('[fetchAnnouncements] fetched posts:', data)
    return (data ?? []) as OrgPost[]
  } catch (e) {
    console.error('[fetchAnnouncements] Supabase error:', e)
    return [] as OrgPost[]
  }
}
