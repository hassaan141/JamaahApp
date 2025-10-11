import { useCallback, useEffect, useState } from 'react'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'
import { getUserId } from '@/Utils/getUserID'
import type { DailyPrayerTimes } from '@/Utils/prayerTimes'

type UIState = {
  org: { id?: string; name?: string; address?: string } | null
  distance_m: number | null
  times: DailyPrayerTimes | null
}

type OrgMeta = { id?: string; name?: string; address?: string }
type Resolved = {
  org: OrgMeta
  distance_m: number | null
  times: DailyPrayerTimes | null
}

function shapeForUI(resolved: Resolved): UIState {
  return {
    org: resolved.org ?? null,
    distance_m: resolved.distance_m ?? null,
    times: resolved.times ?? null,
  }
}

export function usePrayerTimes() {
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<UIState>({
    org: null,
    distance_m: null,
    times: null,
  })

  const retrieve = useCallback(async () => {
    setLoading(true)
    try {
      const userID = await getUserId()
      const resolved = await resolveOrgForTimes(userID)
      setState(shapeForUI(resolved))
    } catch {
      setState({ org: null, distance_m: null, times: null })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    retrieve()
  }, [retrieve])

  return {
    loading,
    org: state.org,
    distance_m: state.distance_m,
    times: state.times,
    refetchPrayerTimes: retrieve,
    setLoading,
  }
}
