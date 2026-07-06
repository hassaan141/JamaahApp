import { useCallback, useEffect, useState } from 'react'
import {
  resolveOrgForTimes,
  fetchPrayerData,
} from '@/Utils/organizationResolver'
import {
  getPrayerTimesRange,
  toYMD,
  fromYMD,
  getPrayerTimesWindow,
  getPrayerDateNavigation,
  type DailyPrayerTimes,
} from '@/Utils/prayerTimes'
import { useLocation } from '@/Utils/useLocation'
import { useAuth } from '@/Auth/AuthProvider'
import { nearestOrg } from '@/Utils/nearest'
import { DEFAULT_ORG_ID } from '@/Utils/constants'

// 1. Define the State Type including 'mode'
type UIState = {
  org: {
    id?: string
    name?: string
    address?: string
    timezone?: string | null
  } | null
  distance_m: number | null
  mode: 'pinned' | 'auto' | 'guest'
}

export function usePrayerTimes() {
  const { location, isLocationReady } = useLocation()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [targetDate, setTargetDate] = useState<Date>(new Date())

  // Cache for prayer times to allow instant switching
  const [timesCache, setTimesCache] = useState<
    Record<string, DailyPrayerTimes>
  >({})
  const availableDateKeys = Object.keys(timesCache).sort()
  const selectedKey = toYMD(targetDate)
  const selectedIndex = availableDateKeys.indexOf(selectedKey)
  const canPrevDay = selectedIndex > 0
  const canNextDay =
    selectedIndex !== -1 && selectedIndex < availableDateKeys.length - 1

  // 2. Initialize state with default mode
  const [state, setState] = useState<UIState>({
    org: null,
    distance_m: null,
    mode: 'pinned',
  })

  const retrieve = useCallback(async () => {
    // NEW Guard: Wait for location engine to initialize (prevents "Stale" fetch)
    if (!isLocationReady) return

    setLoading(true)
    try {
      const todayStr = toYMD(new Date())
      const userId = session?.user?.id

      // ✅ FIX: Map 'latitude/longitude' to 'lat/lon' for the resolver
      const formattedLocation = location
        ? { lat: location.latitude, lon: location.longitude }
        : undefined

      // GUEST MODE: No user logged in
      if (!userId) {
        let orgId = DEFAULT_ORG_ID
        let distance_m: number | null = null

        // Try to find nearest masjid if location available
        if (location) {
          try {
            const [nearest] = await nearestOrg(
              location.latitude,
              location.longitude,
            )
            orgId = nearest.org_id
            distance_m = Math.round(nearest.distance_m)
          } catch (e) {
            console.log('[usePrayerTimes] Guest nearest org failed:', e)
          }
        }

        // Fetch prayer data for the resolved org
        const data = await fetchPrayerData(orgId, todayStr)

        setState({
          org: data.org ?? null,
          distance_m,
          mode: 'guest',
        })

        if (data.times) {
          setTimesCache((prev) => ({ ...prev, [todayStr]: data.times! }))
        }

        if (data.org?.id) {
          prefetchRange(data.org.id)
        }

        setLoading(false)
        return
      }

      // LOGGED-IN USER: Use full resolver with profile settings
      const resolved = await resolveOrgForTimes(
        userId,
        todayStr,
        formattedLocation,
      )

      setState({
        org: resolved.org ?? null,
        distance_m: resolved.distance_m ?? null,
        mode: resolved.mode ?? 'pinned',
      })

      // Cache today's times
      if (resolved.times) {
        setTimesCache((prev) => ({ ...prev, [todayStr]: resolved.times! }))
      }

      // Prefetch next 14 days
      if (resolved.org?.id) {
        prefetchRange(resolved.org.id)
      }
    } catch (e) {
      console.error('Error fetching prayer times:', e)
    } finally {
      setLoading(false)
    }
  }, [isLocationReady, location, session?.user?.id])

  const prefetchRange = async (orgId: string) => {
    try {
      const { startDate, endDate } = getPrayerTimesWindow()

      const rangeData = await getPrayerTimesRange(orgId, startDate, endDate)
      const newCache: Record<string, DailyPrayerTimes> = {}
      rangeData.forEach((row) => {
        newCache[row.prayer_date] = row
      })

      setTimesCache((prev) => ({ ...prev, ...newCache }))
    } catch (e) {
      console.warn('Prefetch failed', e)
    }
  }

  useEffect(() => {
    retrieve()
  }, [retrieve])

  useEffect(() => {
    if (availableDateKeys.length === 0) return
    if (availableDateKeys.includes(selectedKey)) return

    const fallbackKey = availableDateKeys.find(
      (dateKey) => dateKey >= selectedKey,
    )
    setTargetDate(
      fromYMD(fallbackKey || availableDateKeys[availableDateKeys.length - 1]),
    )
  }, [availableDateKeys, selectedKey])

  const { nextDay, prevDay } = getPrayerDateNavigation(
    availableDateKeys,
    selectedIndex,
    canNextDay,
    canPrevDay,
    setTargetDate,
  )

  const todayKey = toYMD(new Date())

  return {
    // UI considers itself loading if we are fetching OR waiting for GPS
    loading: loading || !isLocationReady,
    org: state.org,
    distance_m: state.distance_m,
    mode: state.mode,

    times: timesCache[selectedKey] || null,
    todayTimes: timesCache[todayKey] || null,

    refetchPrayerTimes: retrieve,
    setLoading,
    targetDate,
    nextDay,
    prevDay,
    canNextDay,
    canPrevDay,
  }
}
