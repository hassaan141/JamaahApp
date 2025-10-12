import { supabase } from '@/Supabase/supabaseClient'
import { getCoarseLocation } from '@/Utils/useLocation'
import { getLocState, upsertLocState } from '@/Utils/locationState'
import { nearestOrg } from '@/Utils/nearest'
import { getPrayerTimes } from '@/Utils/prayerTimes'
import { minutesSince, sameLocalDate } from '@/Utils/datetime'
import { getProfile } from '@/Utils/profile'

// Simple haversine implementation (meters)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const DIST_M = 500
const TTL_MIN = 360

async function getOrgMeta(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, address, province_state, country, latitude, longitude')
    .eq('id', orgId)
    .single()
  if (error) throw error
  return data as {
    id: string
    name: string
    address: string
    province_state: string | null
    country: string | null
    latitude: number | null
    longitude: number | null
  }
}

export async function resolveOrgForTimes(userId: string) {
  const profile = await getProfile(userId)

  if (profile.mode === 'pinned' && profile.pinned_org_id) {
    const [times, org] = await Promise.all([
      getPrayerTimes(profile.pinned_org_id),
      getOrgMeta(profile.pinned_org_id),
    ])

    let distance_m: number | null = null
    try {
      const location = await getCoarseLocation()
      if (location && org.latitude && org.longitude) {
        distance_m = Math.round(
          haversine(
            location.latitude,
            location.longitude,
            org.latitude,
            org.longitude,
          ),
        )
      }
    } catch {
      // ignore distance errors
    }

    return { org, distance_m, times }
  }

  const [locOrNull, state] = await Promise.all([
    getCoarseLocation().catch(() => null),
    getLocState(userId),
  ])

  if (!locOrNull) {
    if (!state?.last_org_id) throw new Error('location-denied-and-no-cache')
    const [times, org] = await Promise.all([
      getPrayerTimes(state.last_org_id),
      getOrgMeta(state.last_org_id),
    ])

    let distance_m = state.last_distance_m
    if (
      !distance_m &&
      state.last_lat &&
      state.last_lon &&
      org.latitude &&
      org.longitude
    ) {
      distance_m = Math.round(
        haversine(state.last_lat, state.last_lon, org.latitude, org.longitude),
      )
    }

    return { org, distance_m: distance_m ?? null, times }
  }

  const osLoc = locOrNull
  const moved =
    state?.last_lat && state?.last_lon
      ? haversine(
          osLoc.latitude,
          osLoc.longitude,
          state.last_lat,
          state.last_lon,
        )
      : Infinity

  const movedFar = moved > DIST_M
  const ttlExpired =
    !state?.last_resolved_at || minutesSince(state.last_resolved_at) > TTL_MIN
  const dayChanged =
    !state?.last_resolved_at ||
    !sameLocalDate(state.last_resolved_at, new Date().toISOString())

  let orgId = state?.last_org_id || null
  let dist = state?.last_distance_m || 0

  if (!orgId || movedFar || ttlExpired || dayChanged) {
    const [nearest] = await nearestOrg(osLoc.latitude, osLoc.longitude)
    orgId = nearest.org_id
    dist = Math.round(nearest.distance_m)
    await upsertLocState({
      user_id: userId,
      last_lat: osLoc.latitude,
      last_lon: osLoc.longitude,
      last_org_id: orgId,
      last_distance_m: dist,
      last_resolved_at: new Date().toISOString(),
    })
  }

  const [times, org] = await Promise.all([
    getPrayerTimes(orgId as string),
    getOrgMeta(orgId as string),
  ])

  return { org, distance_m: dist, times }
}
