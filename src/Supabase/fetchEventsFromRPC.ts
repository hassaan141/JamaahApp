import { supabase } from './supabaseClient'
import type { Database } from '@/types/supabase'

type OrgPostRow = Database['public']['Tables']['org_posts']['Row']

export type EventItem = Pick<
  OrgPostRow,
  | 'id'
  | 'organization_id'
  | 'title'
  | 'body'
  | 'post_type'
  | 'date'
  | 'start_time'
  | 'end_time'
  | 'location'
  | 'demographic'
  | 'lat'
  | 'long'
> & {
  dist_km: number
  organization_name: string
}

export async function fetchNearbyEvents(
  lat: number,
  lon: number,
  opts: {
    query?: string
    demographic?: string
    limit?: number
    offset?: number
  } = {},
) {
  const { query = '', demographic = null, limit = 20, offset = 0 } = opts

  if (lat == null || lon == null)
    throw new Error('Location coordinates are required')

  const params = {
    user_lat: lat,
    user_long: lon,
    search_query: query,
    filter_demographic: demographic,
    limit_count: limit,
    offset_count: offset,
  }

  try {
    const { data, error } = await supabase.rpc('search_events', params)

    if (error) {
      console.error('[fetchNearbyEvents] Supabase RPC error:', error)
      throw error
    }

    return data as EventItem[]
  } catch (err) {
    console.error('[fetchNearbyEvents] Error:', err)
    throw err
  }
}
