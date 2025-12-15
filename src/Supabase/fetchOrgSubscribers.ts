import { supabase } from './supabaseClient'

export async function fetchOrgSubscribers(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select('profile_id, push_enabled, created_at')
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching org subscribers:', error)
    throw new Error(error.message)
  }

  console.log('The data is ', data)

  const subscribers = data || []
  console.log(
    `[fetchOrgSubscribers] Found ${subscribers.length} subscribers for org ${organizationId}`,
  )

  subscribers.forEach((sub, index) => {
    console.log(
      `  ${index + 1}. Profile: ${sub.profile_id} | Push: ${sub.push_enabled}`,
    )
  })

  return subscribers
}
