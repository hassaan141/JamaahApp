import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'
import type { Organization } from '@/types'

export type FollowedOrganization = Organization & {
  push_enabled: boolean
}

type SubscriptionWithOrg = {
  push_enabled: boolean
  organizations: Organization | null
}

/**
 * Fetches all organizations that the current user follows.
 * Returns organization details along with push_enabled preference.
 */
export async function fetchMyFollowedOrgs(): Promise<FollowedOrganization[]> {
  try {
    const profileId = await getUserId()
    if (!profileId) {
      console.warn('[fetchMyFollowedOrgs] No profile ID found')
      return []
    }

    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(
        `
        push_enabled,
        organizations (
          id,
          name,
          type,
          address,
          city,
          province_state,
          country,
          postal_code,
          latitude,
          longitude,
          contact_name,
          contact_phone,
          contact_email,
          website,
          facebook,
          instagram,
          twitter,
          prayer_times_url,
          is_active,
          approved_at,
          geom,
          description,
          amenities,
          timezone
        )
      `,
      )
      .eq('profile_id', profileId)

    if (error) {
      console.error('[fetchMyFollowedOrgs] Error:', error)
      return []
    }

    // Transform the data to flatten organization details
    const followedOrgs: FollowedOrganization[] = (
      (data as SubscriptionWithOrg[]) || []
    )
      .filter((item) => item.organizations !== null)
      .map((item) => ({
        ...(item.organizations as Organization),
        push_enabled: item.push_enabled,
      }))

    return followedOrgs
  } catch (e) {
    console.error('[fetchMyFollowedOrgs] Unexpected error:', e)
    return []
  }
}
