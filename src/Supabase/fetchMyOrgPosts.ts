import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'
import type { OrgPost } from '@/types'

export async function fetchMyOrgPosts(): Promise<OrgPost[]> {
  // Fetch current user's org_id via profiles
  const userId = await getUserId()
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', userId)
    .maybeSingle()
  if (pErr) throw pErr
  const orgId = (profile as { org_id: string | null } | null)?.org_id
  if (!orgId) return []
  const { data, error } = await supabase
    .from('org_posts')
    .select('*, organizations (name)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  console.log('Fetched org posts:', data)
  return (data ?? []) as OrgPost[]
}
