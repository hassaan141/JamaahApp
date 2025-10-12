import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'

export async function nearestOrg(
  lat: number,
  lon: number,
): Promise<Array<{ org_id: string; distance_m: number }>> {
  const list = await fetchNearbyMasjids(lat, lon, { limit: 1 })
  return list.map((x) => ({
    org_id: x.id,
    distance_m: (x.distance_km ?? 0) * 1000,
  }))
}
