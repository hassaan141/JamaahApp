//Depreciated, remove soon

import { supabase } from './supabaseClient'
import type { OrgPost } from '@/types'

export async function fetchOrgAnnouncements(
  orgId: string,
  opts: { limit?: number } = {},
): Promise<OrgPost[]> {
  try {
    const { limit = 30 } = opts
    const { data, error } = await supabase
      .from('org_posts')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data ?? []) as OrgPost[]
  } catch (e) {
    console.error('[fetchOrgAnnouncements] Supabase error:', e)
    return []
  }
}
