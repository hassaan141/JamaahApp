import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../Supabase/supabaseClient'
import type {
  Session as SupabaseSession,
  AuthChangeEvent,
} from '@supabase/supabase-js'
import { ensureProfileExists } from '../Supabase/ensureProfileExists'
import { PushNotificationManager } from '../Utils/pushNotifications'
import { syncPrayerSubscription } from '@/Utils/pushNotifications'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Define type locally to match DB enum (or import if you have a types file)
type NotificationPreference = 'None' | 'Adhan' | 'Event_Adhan'

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

  useEffect(() => {
    const id = session?.user?.id
    if (!id) return

    const init = async () => {
      try {
        await ensureProfileExists(id)

        await PushNotificationManager.getInstance().initialize(id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('mode, pinned_org_id, notification_preference') // 👈 Added preference
          .eq('id', id)
          .single()

        let targetOrgId: string | null = null

        const preference =
          profile?.notification_preference as NotificationPreference

        if (preference !== 'None') {
          if (profile?.mode === 'pinned') {
            // If pinned, use their manual choice
            targetOrgId = profile.pinned_org_id
          } else {
            const { data: locationState } = await supabase
              .from('last_location_state')
              .select('last_org_id')
              .eq('user_id', id)
              .single()

            targetOrgId = locationState?.last_org_id || null
          }
        } else {
          console.log(
            '[AuthProvider] User has disabled notifications. Skipping subscription logic.',
          )
        }

        console.log('[AuthProvider] Syncing prayer topic to:', targetOrgId)
        await syncPrayerSubscription(targetOrgId)
      } catch (err) {
        console.error('[AuthProvider] Init failed:', err)
      }
    }

    init()
  }, [session?.user?.id])

  const setSession = (s: NonNullable<Session>) => setSessionState(s)

  const logout = async () => {
    // 1. Unsubscribe from current topic
    const currentTopicId = await AsyncStorage.getItem('prayer_sub_org_id')
    if (currentTopicId) {
      await messaging().unsubscribeFromTopic(`org_${currentTopicId}_prayers`)
      await AsyncStorage.removeItem('prayer_sub_org_id')
    }

    // 2. Sign out of Supabase
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
