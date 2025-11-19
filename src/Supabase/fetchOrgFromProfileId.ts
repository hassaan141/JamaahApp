import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

export async function fetchOrganizationByProfileId() {
  const userId = await getUserId()
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', userId)
      .single()

    if (!profile?.org_id) return null

    const { data: organization } = await supabase
      .from('organizations')
      .select('name, description')
      .eq('id', profile.org_id)
      .single()

    return organization
  } catch (error) {
    console.error('Error fetching organization:', error)
    return null
  }
}
