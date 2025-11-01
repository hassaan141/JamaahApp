import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

// Counts followers for the current user's organization
export async function fetchOrgFollowerCount(): Promise<number> {
  const userId = await getUserId()
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', userId)
    .maybeSingle()
  if (pErr) throw pErr
  const orgId = (profile as { org_id: string | null } | null)?.org_id
  if (!orgId) return 0
  const { count, error } = await supabase
    .from('organization_subscriptions')
    .select('organization_id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
  if (error) throw error
  return count ?? 0
}
