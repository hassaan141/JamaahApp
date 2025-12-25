import { supabase } from '@/Supabase/supabaseClient'
import type { Database } from '@/types/supabase'

export type DailyPrayerTimes =
  Database['public']['Tables']['daily_prayer_times']['Row']

function toYMD(d: Date): string {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
