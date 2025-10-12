import { supabase } from '@/Supabase/supabaseClient'

export type DailyPrayerTimes = {
  id: string
  organization_id: string
  prayer_date: string
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
  jumah_time_1: string | null
  jumah_time_2: string | null
  jumah_time_3: string | null
}

export async function getPrayerTimes(
  orgId: string,
): Promise<DailyPrayerTimes | null> {
  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return data as DailyPrayerTimes
}
