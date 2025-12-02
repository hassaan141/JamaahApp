import { supabase } from './supabaseClient'
import type { Database } from '@/types/supabase'

type OrganizationUpdateData = Partial<
  Database['public']['Tables']['organizations']['Update']
>

export async function updateOrganization(
  orgId: string,
  data: OrganizationUpdateData,
) {
  try {
    if (!orgId) {
      return { ok: false, error: 'Organization ID is required' }
    }

    const { error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', orgId)

    if (error) {
      console.error('[updateOrganization] Database error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error('[updateOrganization] Unexpected error:', err)
    return { ok: false, error: 'Failed to update organization' }
  }
}
