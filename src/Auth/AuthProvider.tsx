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
import {
  startBackgroundTracking,
  stopBackgroundTracking,
} from '../Utils/BackgroundLocationTask'
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

  useEffect(() => {
    const id = session?.user?.id
    if (!id) return

    const initUserData = async () => {
      try {
        await ensureProfileExists(id)
        await PushNotificationManager.getInstance().initialize(id)

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

        let targetOrgId: string | null = null
        const preference =
          (profile?.notification_preference as NotificationPreference) ||
          'Adhan'

        if (preference !== 'None') {
          if (profile?.mode === 'pinned') {
            targetOrgId = profile.pinned_org_id
            await stopBackgroundTracking()
          } else {
            const { data: locationState } = await supabase
              .from('last_location_state')
              .select('last_org_id')
              .eq('user_id', id)
              .maybeSingle()

            targetOrgId = locationState?.last_org_id || null
            await startBackgroundTracking()
          }
        } else {
          await stopBackgroundTracking()
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

      // 1. Stop location tracking
      await stopBackgroundTracking()

      // 2. Clean up DB Token
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

      // 3. Unsubscribe from Topic (Using the CORRECT key)
      const currentTopicId = await AsyncStorage.getItem('current_prayer_topic')
      if (currentTopicId) {
        await messaging().unsubscribeFromTopic(`org_${currentTopicId}_prayers`)
        await AsyncStorage.removeItem('current_prayer_topic')
      }

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
