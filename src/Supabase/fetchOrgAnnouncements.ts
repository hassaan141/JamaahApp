//Depreciated, remove soon

import { supabase } from './supabaseClient'

export type OrgAnnouncement = {
  id: string | number
  organization_id: string | number
  author_profile_id?: string | null
  title: string
  body?: string | null
  type?: string | null
  created_at: string
  organization_name?: string | null
}

export async function fetchOrgAnnouncements(
  orgId: string,
  opts: { limit?: number } = {},
): Promise<OrgAnnouncement[]> {
  try {
    const { limit = 30 } = opts
    const { data, error } = await supabase
      .from('org_posts')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data ?? []) as OrgAnnouncement[]
  } catch (e) {
    console.error('[fetchOrgAnnouncements] Supabase error:', e)
    return []
  }
}
