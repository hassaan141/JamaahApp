import { useCallback, useEffect, useState } from 'react'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'
import { getUserId } from '@/Utils/getUserID'
import type { DailyPrayerTimes } from '@/Utils/prayerTimes'

type UIPrayerTimes = {
  org?: { id?: string; name?: string; address?: string }
  distance_m?: number | null
  fajr_azan: string
  sunrise: string
  dhuhr_azan: string
  asr_azan: string
  maghrib_azan: string
  isha_azan: string
  tmrw_fajr_azan: string
  fajr_iqamah: string
  dhuhr_iqamah: string
  asr_iqamah: string
  maghrib_iqamah: string
  isha_iqamah: string
  tmrw_fajr_iqamah: string
}

type OrgMeta = { id?: string; name?: string; address?: string }
type Resolved = {
  org: OrgMeta
  distance_m: number | null
  times: DailyPrayerTimes
}

function shapeForUI(resolved: Resolved): UIPrayerTimes {
  return {
    ...(resolved.times as unknown as UIPrayerTimes),
    org: resolved.org,
    distance_m: resolved.distance_m,
  }
}

export function usePrayerTimes() {
  const [loading, setLoading] = useState(true)
  const [prayerTimes, setPrayerTimes] = useState<UIPrayerTimes | null>(null)

  const retrieve = useCallback(async () => {
    setLoading(true)
    try {
      const userID = await getUserId()
      const resolved = await resolveOrgForTimes(userID)
      setPrayerTimes(shapeForUI(resolved))
    } catch {
      setPrayerTimes(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    retrieve()
  }, [retrieve])

  return {
    loading,
    prayerTimes,
    refetchPrayerTimes: retrieve,
    setLoading,
  }
}
