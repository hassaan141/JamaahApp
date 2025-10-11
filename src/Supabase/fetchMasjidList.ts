import { supabase } from './supabaseClient'

export async function fetchNearbyMasjids(
  lat: number,
  lon: number,
  opts: { q?: string; limit?: number } = {},
) {
  const { q = '', limit = 15 } = opts
  if (lat == null || lon == null)
    throw new Error('Location coordinates are required')
  if (typeof lat !== 'number' || typeof lon !== 'number')
    throw new Error('Invalid location coordinates')

  const params = {
    user_lat: lat,
    user_lon: lon,
    q,
    lim: limit,
  } as unknown as never

  const { data, error } = await supabase.rpc(
    'get_closest_organizations_masjids',
    params,
  )
  if (error) throw error
  if (!data) throw new Error('No data returned from Supabase')
  return data as Array<{
    id: string
    name: string
    address: string
    distance_km?: number
  }>
}
