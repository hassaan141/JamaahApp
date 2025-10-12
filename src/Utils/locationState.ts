import { supabase } from '@/Supabase/supabaseClient'

export type LocationState = {
  user_id: string
  last_lat: number | null
  last_lon: number | null
  last_org_id: string | null
  last_distance_m: number | null
  last_resolved_at: string | null // ISO string
}

export async function getLocState(
  userId: string,
): Promise<LocationState | null> {
  const { data, error } = await supabase
    .from('user_location_state')
    .select(
      'user_id, last_lat, last_lon, last_org_id, last_distance_m, last_resolved_at',
    )
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as LocationState | null) ?? null
}

export async function upsertLocState(state: LocationState): Promise<void> {
  const { error } = await supabase
    .from('user_location_state')
    .upsert(state as unknown as never, { onConflict: 'user_id' })
  if (error) throw error
}
