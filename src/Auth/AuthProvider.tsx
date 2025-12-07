import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../Supabase/supabaseClient'
import type {
  Session as SupabaseSession,
  AuthChangeEvent,
} from '@supabase/supabase-js'
import { ensureProfileExists } from '../Supabase/ensureProfileExists'
import { PushNotificationManager } from '../Utils/pushNotifications'
import { syncPrayerSubscription } from '@/Utils/pushNotifications' // ✅ Import added

type Session = SupabaseSession | null

type AuthContextValue = {
  session: Session
  setSession: (s: NonNullable<Session>) => void
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSessionState(data.session)
      setLoading(false)
    })()

    const { data } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, newSession: SupabaseSession | null) => {
        setSessionState(newSession)
        setLoading(false)
      },
    )

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Ensure a profile row exists whenever we have a signed-in user
  useEffect(() => {
    const id = session?.user?.id
    if (!id) return

    const init = async () => {
      try {
        // 1. Ensure Profile Exists first
        await ensureProfileExists(id)

        // 2. Initialize Push (Register Token)
        await PushNotificationManager.getInstance().initialize(id)

        // 3. 👇 NEW: Fetch Profile Data to sync Prayer Subscription
        // We need to know if they are in 'pinned' or 'auto' mode
        const { data: profile } = await supabase
          .from('profiles')
          .select('mode, pinned_org_id')
          .eq('id', id)
          .single()

        // 4. Determine which Mosque to listen to
        let targetOrgId = null

        if (profile?.mode === 'pinned') {
          // If pinned, use their manual choice
          targetOrgId = profile.pinned_org_id
        } else {
          // If auto, try to get the last known auto-detected mosque
          // (Assuming you have this table from your schema)
          const { data: locationState } = await supabase
            .from('last_location_state')
            .select('last_org_id')
            .eq('user_id', id)
            .single()

          targetOrgId = locationState?.last_org_id || null
        }

        // 5. Sync the Topic
        if (targetOrgId) {
          console.log(
            '[AuthProvider] Syncing initial prayer topic:',
            targetOrgId,
          )
          await syncPrayerSubscription(targetOrgId)
        }
      } catch (err) {
        console.error('[AuthProvider] Init failed:', err)
      }
    }

    init()
  }, [session?.user?.id])

  const setSession = (s: NonNullable<Session>) => setSessionState(s)

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSessionState(null)
  }

  return (
    <AuthContext.Provider value={{ session, setSession, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useAuthStatus() {
  const { session } = useAuth()
  return {
    isLoggedIn: !!session,
    isVerified: !!session?.user?.email_confirmed_at,
    userId: session?.user?.id,
    email: session?.user?.email,
  }
}
