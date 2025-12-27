import { supabase } from '@/Supabase/supabaseClient'
import { getCoarseLocation } from '@/Utils/useLocation'
import { getLocState, upsertLocState } from '@/Utils/locationState'
import { nearestOrg } from '@/Utils/nearest'
import { getPrayerTimes } from '@/Utils/prayerTimes'
import { minutesSince, sameLocalDate } from '@/Utils/datetime'
import { getProfile } from '@/Utils/profile'
import { syncPrayerSubscription } from '@/Utils/pushNotifications'

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

/**
 * PURE FUNCTION: Fetches raw metadata for a specific organization
 */
async function getOrgMeta(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select(
      'id, name, address, province_state, country, latitude, longitude, timezone',
    )
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
    timezone: string | null
  }
}

/**
 * PURE DATA FETCHING FUNCTION:
 * Use this in OrganizationDetail.tsx to get prayer times for a specific ID.
 */
export async function fetchPrayerData(orgId: string, dateStr?: string) {
  const [times, org] = await Promise.all([
    getPrayerTimes(orgId, dateStr),
    getOrgMeta(orgId),
  ])
  return { org, times }
}

/**
 * GLOBAL RESOLVER:
 * Handles the logic for "Auto" vs "Pinned" mode for the Home Screen.
 */
export async function resolveOrgForTimes(
  userId: string,
  dateStr?: string,
  overrideLocation?: { lat: number; lon: number },
) {
  const profile = await getProfile(userId)
  const mode = profile.mode as 'pinned' | 'auto'

  // --- CASE 1: PINNED MODE ---
  if (mode === 'pinned' && profile.pinned_org_id) {
    const data = await fetchPrayerData(profile.pinned_org_id, dateStr)
    const { org } = data

    let distance_m: number | null = null
    try {
      const location = overrideLocation
        ? { latitude: overrideLocation.lat, longitude: overrideLocation.lon }
        : await getCoarseLocation()

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
    } catch (e) {
      console.log('[organizationResolver] distance calc error:', e)
    }

    return { ...data, distance_m, mode }
  }

  // --- CASE 2: AUTO MODE (GPS) ---
  const [locOrNull, state] = await Promise.all([
    overrideLocation
      ? Promise.resolve({
          latitude: overrideLocation.lat,
          longitude: overrideLocation.lon,
        })
      : getCoarseLocation().catch(() => null),
    getLocState(userId),
  ])

  // Handle No GPS available
  if (!locOrNull) {
    if (!state?.last_org_id) throw new Error('location-denied-and-no-cache')

    if (profile.notification_preference !== 'None') {
      await syncPrayerSubscription(state.last_org_id)
    }

    const data = await fetchPrayerData(state.last_org_id, dateStr)
    const { org } = data

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

    return { ...data, distance_m: distance_m ?? null, mode }
  }

  // Handle GPS Movement / TTL Logic
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

  // Trigger nearest masjid calculation if moved or cache expired
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

  if (orgId && profile.notification_preference !== 'None') {
    await syncPrayerSubscription(orgId)
  }

  const data = await fetchPrayerData(orgId as string, dateStr)

  return { ...data, distance_m: dist, mode }
}
