import { useCallback, useEffect, useState } from 'react'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'
import { getUserId } from '@/Utils/getUserID'
import { getPrayerTimesRange, type DailyPrayerTimes } from '@/Utils/prayerTimes'

// 1. Define the State Type including 'mode'
type UIState = {
  org: {
    id?: string
    name?: string
    address?: string
    timezone?: string | null
  } | null
  distance_m: number | null
  mode: 'pinned' | 'auto'
}

function toYYYYMMDD(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function usePrayerTimes() {
  const [loading, setLoading] = useState(true)
  const [targetDate, setTargetDate] = useState<Date>(new Date())

  // Cache for prayer times to allow instant switching
  const [timesCache, setTimesCache] = useState<
    Record<string, DailyPrayerTimes>
  >({})

  // 2. Initialize state with default mode
  const [state, setState] = useState<UIState>({
    org: null,
    distance_m: null,
    mode: 'pinned',
  })

  const retrieve = useCallback(async () => {
    setLoading(true)
    try {
      const userID = await getUserId()
      const todayStr = toYYYYMMDD(new Date())

      // Fetch Org, Location, and Mode
      const resolved = await resolveOrgForTimes(userID, todayStr)

      setState({
        org: resolved.org ?? null,
        distance_m: resolved.distance_m ?? null,
        // 3. Save the mode from the resolver
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
  }, [])

  const prefetchRange = async (orgId: string) => {
    try {
      const start = new Date()
      start.setDate(start.getDate() - 2)
      const end = new Date()
      end.setDate(end.getDate() + 14)

      const rangeData = await getPrayerTimesRange(
        orgId,
        toYYYYMMDD(start),
        toYYYYMMDD(end),
      )
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

  const nextDay = () => {
    const next = new Date(targetDate)
    next.setDate(next.getDate() + 1)
    setTargetDate(next)
  }

  const prevDay = () => {
    const prev = new Date(targetDate)
    prev.setDate(prev.getDate() - 1)
    setTargetDate(prev)
  }

  const selectedKey = toYYYYMMDD(targetDate)
  const todayKey = toYYYYMMDD(new Date())

  return {
    loading,
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
  }
}
