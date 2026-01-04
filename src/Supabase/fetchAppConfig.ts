import { supabase } from './supabaseClient'

export async function fetchMinSupportedVersion(): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'min_supported_version')
    .single()

  if (error) return null

  return data?.value ?? null
}
