import { supabase } from './supabaseClient'

export async function followOrganization(orgId: string | number) {
  try {
    // Cast to any to avoid touching generated Database types during the migration.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('organization_follows')
      .insert([{ organization_id: orgId }])
    if (error) throw error
    return true
  } catch (e) {
    console.error('[followOrganization] error', e)
    return false
  }
}

export async function unfollowOrganization(orgId: string | number) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('organization_follows')
      .delete()
      .eq('organization_id', orgId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('[unfollowOrganization] error', e)
    return false
  }
}
