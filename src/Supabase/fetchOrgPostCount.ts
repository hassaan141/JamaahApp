import { supabase } from './supabaseClient'

export async function fetchOrgPostCount(orgId: string): Promise<number> {
  const { count, error } = await supabase
    .from('org_posts')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
  if (error) throw error
  return count ?? 0
}
