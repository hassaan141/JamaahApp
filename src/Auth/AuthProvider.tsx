import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../Supabase/supabaseClient'
import type {
  Session as SupabaseSession,
  AuthChangeEvent,
} from '@supabase/supabase-js'
import { ensureProfileExists } from '../Supabase/ensureProfileExists'

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
    // Fire and forget; internal function handles its own errors
    ensureProfileExists(id)
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
