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

export type Amenities = {
  street_parking?: boolean
  women_washroom?: boolean
  on_site_parking?: boolean
  women_prayer_space?: boolean
  wheelchair_accessible?: boolean
}

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
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          address: string
          city: string
          province_state: string
          country: string
          postal_code: string
          latitude: number
          longitude: number
          contact_name: string
          contact_phone: string
          contact_email: string
          website: string | null
          facebook: string | null
          instagram: string | null
          twitter: string | null
          prayer_times_url: string | null
          is_active: boolean
          approved_at: string | null
          geom: string | null
          description?: string | null
          amenities?: Amenities | null
        }
        Insert: Partial<
          Database['public']['Tables']['organizations']['Row']
        > & {
          name: string
          type: string
          address: string
          city: string
          province_state: string
          country: string
          postal_code: string
          contact_name: string
          contact_email: string
        }
        Update: Partial<Database['public']['Tables']['organizations']['Row']>
        Relationships: []
      }
      organization_applications: {
        Row: {
          id: string
          organization_name: string
          organization_type: string
          contact_name: string
          contact_email: string
          contact_phone: string
          website: string | null
          facebook: string | null
          instagram: string | null
          twitter: string | null
          donate_link: string | null
          description: string | null
          application_status: 'submitted' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
          address: string
          city: string
          province_state: string
          country: string
          postal_code: string
          user_id: string
        }
        Insert: Partial<
          Database['public']['Tables']['organization_applications']['Row']
        > & {
          organization_name: string
          organization_type: string
          contact_name: string
          contact_email: string
          address: string
          city: string
          country: string
          application_status: 'submitted' | 'approved' | 'rejected'
        }
        Update: Partial<
          Database['public']['Tables']['organization_applications']['Row']
        >
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          organization_id: string
          profile_id: string
          push_enabled: boolean
          created_at: string | null
        }
        Insert: {
          organization_id: string
          profile_id: string
          push_enabled?: boolean
          created_at?: string | null
        }
        Update: {
          organization_id?: string
          profile_id?: string
          push_enabled?: boolean
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'organization_subscriptions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_subscriptions_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      org_posts: {
        Row: {
          id: string
          organization_id: string
          author_profile_id: string | null
          title: string
          body: string | null
          post_type: string | null
          demographic: string | null
          recurs_on_days: number[] | null
          start_time: string | null
          end_time: string | null
          date: string | null
          send_push: boolean
          created_at: string
          location: string | null
          lat: number | null
          long: number | null
          organizations?: { name: string } | null
        }
        Insert: {
          id?: string
          organization_id: string
          author_profile_id?: string | null
          title: string
          body?: string | null
          post_type?: string | null
          demographic?: string | null
          recurs_on_days?: number[] | null
          start_time?: string | null
          end_time?: string | null
          date?: string | null
          send_push?: boolean
          created_at?: string
          location: string | null
          lat: number | null
          long: number | null
          organizations?: { name: string } | null
        }
        Update: {
          id?: string
          organization_id?: string
          author_profile_id?: string | null
          title?: string
          body?: string | null
          post_type?: string | null
          demographic?: string | null
          recurs_on_days?: number[] | null
          start_time?: string | null
          end_time?: string | null
          date?: string | null
          send_push?: boolean
          created_at?: string
          location: string | null
          lat: number | null
          long: number | null
          organizations?: { name: string } | null
        }
        Relationships: [
          {
            foreignKeyName: 'org_posts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_closest_organizations_masjids: {
        Args: {
          user_lat: number
          user_lon: number
          q: string
          lim: number
        }
        Returns: Array<{
          id: string
          name: string
          address: string
          distance_km: number | null
        }>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
