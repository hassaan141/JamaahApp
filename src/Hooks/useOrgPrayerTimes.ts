import { useCallback, useEffect, useState } from 'react'
import { fetchPrayerData } from '@/Utils/organizationResolver'
import { getPrayerTimesRange, type DailyPrayerTimes } from '@/Utils/prayerTimes'

function toYYYYMMDD(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useOrgPrayerTimes(orgId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [targetDate, setTargetDate] = useState<Date>(new Date())
  const [timesCache, setTimesCache] = useState<
    Record<string, DailyPrayerTimes>
  >({})
  const [orgMeta, setOrgMeta] = useState<{ name?: string; id?: string } | null>(
    null,
  )

  const retrieve = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const todayStr = toYYYYMMDD(new Date())
      // Use the pure fetcher to get specific org data
      const resolved = await fetchPrayerData(orgId, todayStr)

      setOrgMeta(resolved.org)

      if (resolved.times) {
        setTimesCache((prev) => ({ ...prev, [todayStr]: resolved.times! }))
      }

      // Prefetch range for this specific masjid
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
      console.error('[useOrgPrayerTimes] Error:', e)
    } finally {
      setLoading(false)
    }
  }, [orgId])

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
    orgName: orgMeta?.name,
    times: timesCache[selectedKey] || null,
    todayTimes: timesCache[todayKey] || null,
    targetDate,
    nextDay,
    prevDay,
    refresh: retrieve,
  }
}
