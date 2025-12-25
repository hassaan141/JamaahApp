import { useCallback, useEffect, useState } from 'react'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'
import { getUserId } from '@/Utils/getUserID'
import { getPrayerTimesRange, type DailyPrayerTimes } from '@/Utils/prayerTimes'

type UIState = {
  org: {
    id?: string
    name?: string
    address?: string
    timezone?: string | null
  } | null
  distance_m: number | null
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
  const [timesCache, setTimesCache] = useState<
    Record<string, DailyPrayerTimes>
  >({})

  const [state, setState] = useState<UIState>({
    org: null,
    distance_m: null,
  })

  const retrieve = useCallback(async () => {
    setLoading(true)
    try {
      const userID = await getUserId()
      const todayStr = toYYYYMMDD(new Date())

      const resolved = await resolveOrgForTimes(userID, todayStr)
      setState({
        org: resolved.org ?? null,
        distance_m: resolved.distance_m ?? null,
      })

      if (resolved.times) {
        setTimesCache((prev) => ({ ...prev, [todayStr]: resolved.times! }))
      }

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

  // DATA SELECTORS
  const selectedKey = toYYYYMMDD(targetDate)
  const todayKey = toYYYYMMDD(new Date())

  return {
    loading,
    org: state.org,
    distance_m: state.distance_m,

    // 1. DYNAMIC (For Modal - Changes with navigation)
    times: timesCache[selectedKey] || null,

    // 2. STABLE (For Card - Always Today)
    todayTimes: timesCache[todayKey] || null,

    refetchPrayerTimes: retrieve,
    setLoading,
    targetDate,
    nextDay,
    prevDay,
  }
}
