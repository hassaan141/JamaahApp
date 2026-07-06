import { supabase } from '@/Supabase/supabaseClient'
import type { Database } from '@/types/supabase'

export type DailyPrayerTimes =
  Database['public']['Tables']['daily_prayer_times']['Row']

export function toYMD(d: Date): string {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromYMD(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getPrayerTimesWindow(baseDate: Date = new Date()) {
  const start = new Date(baseDate)
  start.setDate(start.getDate() - 1)

  const end = new Date(baseDate)
  end.setMonth(end.getMonth() + 1, 0)

  return {
    startDate: toYMD(start),
    endDate: toYMD(end),
  }
}

export function nextDay(
  availableDateKeys: string[],
  selectedIndex: number,
  canNextDay: boolean,
  setTargetDate: (date: Date) => void,
) {
  if (!canNextDay) return
  setTargetDate(fromYMD(availableDateKeys[selectedIndex + 1]))
}

export function prevDay(
  availableDateKeys: string[],
  selectedIndex: number,
  canPrevDay: boolean,
  setTargetDate: (date: Date) => void,
) {
  if (!canPrevDay) return
  setTargetDate(fromYMD(availableDateKeys[selectedIndex - 1]))
}

export function getPrayerDateNavigation(
  availableDateKeys: string[],
  selectedIndex: number,
  canNextDay: boolean,
  canPrevDay: boolean,
  setTargetDate: (date: Date) => void,
) {
  return {
    nextDay: () =>
      nextDay(availableDateKeys, selectedIndex, canNextDay, setTargetDate),
    prevDay: () =>
      prevDay(availableDateKeys, selectedIndex, canPrevDay, setTargetDate),
  }
}

export async function getPrayerTimes(
  orgId: string,
  dateStr?: string,
): Promise<DailyPrayerTimes | null> {
  const targetDate = dateStr || toYMD(new Date())
  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('*')
    .eq('organization_id', orgId)
    .eq('prayer_date', targetDate)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return data as DailyPrayerTimes
}

// NEW: Fetch multiple days at once for speed
export async function getPrayerTimesRange(
  orgId: string,
  startDate: string,
  endDate: string,
): Promise<DailyPrayerTimes[]> {
  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('*')
    .eq('organization_id', orgId)
    .gte('prayer_date', startDate)
    .lte('prayer_date', endDate)

  if (error) {
    console.error('Error fetching range:', error)
    return []
  }
  return (data || []) as DailyPrayerTimes[]
}
