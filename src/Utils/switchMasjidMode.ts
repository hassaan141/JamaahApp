import { supabase } from '../Supabase/supabaseClient'

export async function setAuto(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ mode: 'auto', pinned_org_id: null })
    .eq('id', userId)
  if (error) throw error
}

export async function setPinned(userId: string, orgId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ mode: 'pinned', pinned_org_id: orgId })
    .eq('id', userId)
  if (error) throw error
}
