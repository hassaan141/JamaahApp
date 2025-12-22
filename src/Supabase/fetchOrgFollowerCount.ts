import { supabase } from './supabaseClient'

// Counts followers for the current user's organization
export async function fetchOrgFollowerCount(orgId: string): Promise<number> {
  const { count, error } = await supabase
    .from('organization_subscriptions')
    .select('organization_id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
  if (error) throw error
  return count ?? 0
}
