import { supabase } from '@/Supabase/supabaseClient'

export type Profile = {
  id: string
  mode: 'auto' | 'pinned'
  pinned_org_id: string | null
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, mode, pinned_org_id')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as Profile
}
