import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../Supabase/supabaseClient'
import type {
  Session as SupabaseSession,
  AuthChangeEvent,
} from '@supabase/supabase-js'
import { ensureProfileExists } from '../Supabase/ensureProfileExists'
import {
  PushNotificationManager,
  syncPrayerSubscription,
} from '../Utils/pushNotifications'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

  // 1. Initial Session Check
  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (mounted) {
          setSessionState(data.session)
          setLoading(false)
        }
      } catch (err) {
        console.error('Session check failed', err)
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, newSession: SupabaseSession | null) => {
        if (mounted) {
          setSessionState(newSession)
          setLoading(false)
        }
      },
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  // 2. Hydrate User Data (Profile & Notifications)
  useEffect(() => {
    const id = session?.user?.id
    if (!id) return

    const initUserData = async () => {
      try {
        // Fallback: Ensure profile exists if the DB trigger failed or hasn't run yet
        await ensureProfileExists(id)

        // Initialize Push Notifications
        await PushNotificationManager.getInstance().initialize(id)

        // Fetch User Preferences (Note: No phone/country here)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('mode, pinned_org_id, notification_preference, is_org')
          .eq('id', id)
          .single()

        if (error) {
          console.log(
            '[AuthProvider] Could not fetch profile settings:',
            error.message,
          )
          return
        }

        // Logic to determine which Organization ID to subscribe to
        let targetOrgId: string | null = null
        const preference =
          (profile?.notification_preference as NotificationPreference) ||
          'Adhan'

        if (preference !== 'None') {
          if (profile?.mode === 'pinned') {
            targetOrgId = profile.pinned_org_id
          } else {
            const { data: locationState } = await supabase
              .from('last_location_state')
              .select('last_org_id')
              .eq('user_id', id)
              .maybeSingle()

            targetOrgId = locationState?.last_org_id || null
          }
        }

        if (preference !== 'None') {
          console.log('[AuthProvider] Syncing prayer topic to:', targetOrgId)
          await syncPrayerSubscription(targetOrgId)
        }
      } catch (err) {
        console.error('[AuthProvider] Init failed:', err)
      }
    }

    initUserData()
  }, [session?.user?.id])

  const setSession = (s: NonNullable<Session>) => setSessionState(s)

  const logout = async () => {
    try {
      const userId = session?.user?.id

      // 1. Clean up FCM token from database BEFORE signing out
      if (userId) {
        console.log('[AuthProvider] Cleaning up FCM token for user:', userId)
        try {
          const fcmToken = await messaging().getToken()
          if (fcmToken) {
            await supabase
              .from('devices')
              .delete()
              .eq('profile_id', userId)
              .eq('fcm_token', fcmToken)
            console.log('[AuthProvider] FCM token cleaned up successfully')
          }
        } catch (tokenError) {
          console.warn(
            '[AuthProvider] Could not clean up FCM token:',
            tokenError,
          )
        }
      }

      // 2. Unsubscribe from current topic
      const currentTopicId = await AsyncStorage.getItem('prayer_sub_org_id')
      if (currentTopicId) {
        await messaging().unsubscribeFromTopic(`org_${currentTopicId}_prayers`)
        await AsyncStorage.removeItem('prayer_sub_org_id')
      }

      // 3. Sign out of Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setSessionState(null)
    }
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
