import { supabase } from './supabaseClient'

export async function fetchMasjidsByName(q: string, limit = 15) {
  const { data, error } = await supabase
    .from('organizations')
    .select(
      'id, name, address, city, province_state, country, latitude, longitude, contact_phone',
    )
    .in('type', ['Masjid', 'MSA'])
    .ilike('name', `%${q}%`)
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function fetchNearbyMasjids(
  lat: number,
  lon: number,
  opts: { q?: string; limit?: number } = {},
) {
  console.log(`[fetchNearbyMasjids] Called with lat: ${lat}, lon: ${lon}`)
  const { q = '', limit = 10000 } = opts

  if (lat == null || lon == null) {
    console.error(
      '[fetchNearbyMasjids] Error: Location coordinates are required.',
    )
    throw new Error('Location coordinates are required')
  }
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    console.error(
      `[fetchNearbyMasjids] Error: Invalid location coordinates. lat type: ${typeof lat}, lon type: ${typeof lon}`,
    )
    throw new Error('Invalid location coordinates')
  }

  const params = {
    user_lat: lat,
    user_lon: lon,
    q,
    lim: limit,
  }

  console.log('[fetchNearbyMasjids] Calling Supabase RPC with params:', params)

  try {
    const { data, error } = await supabase.rpc(
      'get_closest_organizations_masjids',
      params as unknown as never,
    )

    if (error) {
      console.error('[fetchNearbyMasjids] Supabase RPC error:', error)
      throw error
    }

    if (!data) {
      console.warn(
        '[fetchNearbyMasjids] No data returned from Supabase, but no error was thrown.',
      )
      throw new Error('No data returned from Supabase')
    }

    console.log(
      `[fetchNearbyMasjids] Successfully fetched ${data.length} masjids.`,
    )
    return data as Array<{
      id: string
      name: string
      address: string
      distance_km?: number
    }>
  } catch (err) {
    console.error(
      '[fetchNearbyMasjids] An unexpected error occurred during the fetch operation:',
      err,
    )
    // Re-throw the error so the calling component's catch block can handle it
    throw err
  }
}
