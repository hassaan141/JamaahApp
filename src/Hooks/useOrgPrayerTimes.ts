import { useCallback, useEffect, useState } from 'react'
import { fetchPrayerData } from '@/Utils/organizationResolver'
import {
  getPrayerTimesRange,
  toYMD,
  fromYMD,
  getPrayerTimesWindow,
  getPrayerDateNavigation,
  type DailyPrayerTimes,
} from '@/Utils/prayerTimes'

export function useOrgPrayerTimes(orgId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [targetDate, setTargetDate] = useState<Date>(new Date())
  const [timesCache, setTimesCache] = useState<
    Record<string, DailyPrayerTimes>
  >({})
  const [orgMeta, setOrgMeta] = useState<{ name?: string; id?: string } | null>(
    null,
  )
  const availableDateKeys = Object.keys(timesCache).sort()
  const selectedKey = toYMD(targetDate)
  const selectedIndex = availableDateKeys.indexOf(selectedKey)
  const canPrevDay = selectedIndex > 0
  const canNextDay =
    selectedIndex !== -1 && selectedIndex < availableDateKeys.length - 1

  const retrieve = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const todayStr = toYMD(new Date())
      // Use the pure fetcher to get specific org data
      const resolved = await fetchPrayerData(orgId, todayStr)

      setOrgMeta(resolved.org)

      if (resolved.times) {
        setTimesCache((prev) => ({ ...prev, [todayStr]: resolved.times! }))
      }

      // Prefetch range for this specific masjid
      const { startDate, endDate } = getPrayerTimesWindow()

      const rangeData = await getPrayerTimesRange(orgId, startDate, endDate)
      const newCache: Record<string, DailyPrayerTimes> = {}
      rangeData.forEach((row) => {
        newCache[row.prayer_date] = row
      })

      setTimesCache((prev) => ({ ...prev, ...newCache }))
    } catch (e) {
      console.error('[useOrgPrayerTimes] Error:', e)
    } finally {
      setLoading(false)
    }
  }, [orgId])

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
    loading,
    orgName: orgMeta?.name,
    times: timesCache[selectedKey] || null,
    todayTimes: timesCache[todayKey] || null,
    targetDate,
    nextDay,
    prevDay,
    canNextDay,
    canPrevDay,
    refresh: retrieve,
  }
}
