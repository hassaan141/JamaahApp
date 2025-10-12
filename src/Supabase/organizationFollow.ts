import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

export async function followOrganization(orgId: string | number) {
  try {
    const profileId = await getUserId()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('organization_subscriptions')
      .upsert(
        [
          {
            organization_id: orgId,
            profile_id: profileId,
          },
        ],
        { onConflict: ['organization_id', 'profile_id'] },
      )
    if (error) throw error
    return true
  } catch (e) {
    console.error('[followOrganization] error', e)
    return false
  }
}

export async function unfollowOrganization(orgId: string | number) {
  try {
    const profileId = await getUserId()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('organization_subscriptions')
      .delete()
      .eq('organization_id', orgId)
      .eq('profile_id', profileId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('[unfollowOrganization] error', e)
    return false
  }
}

export async function isFollowingOrganization(orgId: string | number) {
  try {
    const profileId = await getUserId()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('organization_id', orgId)
      .eq('profile_id', profileId)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return !!data
  } catch (e) {
    console.error('[isFollowingOrganization] error', e)
    return false
  }
}
