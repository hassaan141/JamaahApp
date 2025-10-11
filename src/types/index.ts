import type { Database } from './supabase'
export type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
