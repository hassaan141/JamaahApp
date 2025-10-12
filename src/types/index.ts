import type { Database } from './supabase'
export type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationSubscription =
  Database['public']['Tables']['organization_subscriptions']['Row']
export type OrgPost = Database['public']['Tables']['org_posts']['Row']

export type NearbyMasjid = {
  id: string
  name: string
  address: string
  distance_km: number | null
}
