import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

export async function searchOrganizations({ query = '' } = {}): Promise<
  Record<string, unknown>[]
> {
  try {
    const q = query?.trim() || ''
    let orgs: Record<string, unknown>[] = []
    if (!q) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(50)
      if (error) throw error
      orgs = (data ?? []) as Record<string, unknown>[]
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(50)
      if (error) throw error
      orgs = (data ?? []) as Record<string, unknown>[]
    }

    // Annotate with is_following for the current user (if authenticated)
    try {
      const profileId = await getUserId()
      const { data: followsData, error: followsErr } = await supabase
        .from('organization_follows')
        .select('organization_id')
        .eq('profile_id', profileId)
      if (!followsErr && Array.isArray(followsData)) {
        const followedSet = new Set(
          followsData.map((r: Record<string, unknown>) =>
            String(r.organization_id),
          ),
        )
        return orgs.map((o) => ({
          ...(o as Record<string, unknown>),
          is_following: followedSet.has(
            String((o as Record<string, unknown>).id),
          ),
        }))
      }
    } catch (e) {
      // ignore follow annotation errors, return orgs without is_following
      console.warn('[searchOrganizations] could not annotate follows', e)
    }

    return orgs
  } catch (e) {
    console.error('[searchOrganizations] error', e)
    return []
  }
}
