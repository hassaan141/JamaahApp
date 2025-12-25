import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'
import type { Organization } from '@/types'

export async function searchOrganizations({ query = '' } = {}): Promise<
  (Organization & { is_following?: boolean })[]
> {
  try {
    const q = query?.trim() || ''
    let orgs: Organization[] = []
    if (!q) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(50)
      if (error) throw error
      orgs = (data ?? []) as Organization[]
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(50)
      if (error) throw error
      orgs = (data ?? []) as Organization[]
    }

    // Annotate with is_following for the current user (if authenticated)
    try {
      const profileId = await getUserId()
      const { data: followsData, error: followsErr } = await supabase
        .from('organization_subscriptions')
        .select('organization_id')
        .eq('profile_id', profileId)
      if (!followsErr && Array.isArray(followsData)) {
        const followedSet = new Set(
          followsData.map(
            (r: { organization_id: string }) => r.organization_id,
          ),
        )
        return orgs.map((o) => ({
          ...o,
          is_following: followedSet.has(o.id),
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

export async function fetchOrganizationById(
  id: string,
): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(
        `[fetchOrganizationById] Error fetching organization with id ${id}:`,
        error,
      )
      throw error
    }

    return data as Organization | null
  } catch (err) {
    console.error(`[fetchOrganizationById] Unexpected error for id ${id}:`, err)
    return null
  }
}
