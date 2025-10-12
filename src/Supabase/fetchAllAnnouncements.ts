import { supabase } from './supabaseClient'

export async function fetchAnnouncements(
  opts: { limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  try {
    const { limit = 50 } = opts
    const { data, error } = await supabase
      .from('org_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as Record<string, unknown>[]
  } catch (e) {
    console.error('[fetchAnnouncements] Supabase error:', e)
    return []
  }
}
