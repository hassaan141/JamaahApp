// Source of truth for DB types used in the app.
// Hand-maintained minimal shapes (start with the tables we use and expand as needed).
// If desired later, this file can be replaced with generated types from the Supabase CLI without changing imports.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          country: string | null
          created_at: string
          updated_at: string
          mode: string | null
          pinned_org_id: string | null
          is_org: boolean
          org_id: string | null
          pending_org_name: string | null
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
          mode?: string | null
          pinned_org_id?: string | null
          is_org?: boolean
          org_id?: string | null
          pending_org_name?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
          mode?: string | null
          pinned_org_id?: string | null
          is_org?: boolean
          org_id?: string | null
          pending_org_name?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
