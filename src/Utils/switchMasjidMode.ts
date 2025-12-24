import { supabase } from '../Supabase/supabaseClient'
import { syncPrayerSubscription } from './pushNotifications'

export async function setAuto(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ mode: 'auto', pinned_org_id: null })
    .eq('id', userId)

  if (error) throw error

  const { data: locationState } = await supabase
    .from('last_location_state')
    .select('last_org_id')
    .eq('user_id', userId)
    .maybeSingle()

  const targetOrgId = locationState?.last_org_id || null
  console.log('[SwitchMode] Setting Auto. Syncing to:', targetOrgId)
  await syncPrayerSubscription(targetOrgId)
}

export async function setPinned(userId: string, orgId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ mode: 'pinned', pinned_org_id: orgId })
    .eq('id', userId)

  if (error) throw error

  console.log('[SwitchMode] Setting Pinned. Syncing to:', orgId)
  await syncPrayerSubscription(orgId)
}
