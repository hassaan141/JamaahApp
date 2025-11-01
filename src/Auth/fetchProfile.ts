import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../Supabase/supabaseClient'
import { useAuth } from './AuthProvider'
import type { Profile } from '@/types'

export function useProfile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.user?.id
  const cacheKey = userId ? `profile_${userId}` : null

  const fetchFresh = useCallback(
    async (updateLoading = true) => {
      if (!userId) {
        if (updateLoading) setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setProfile(data as Profile)
          if (cacheKey)
            await AsyncStorage.setItem(cacheKey, JSON.stringify(data))
        } else {
          setProfile(null)
          if (cacheKey) await AsyncStorage.removeItem(cacheKey)
        }
      } catch (e) {
        setError(e as Error)
      } finally {
        if (updateLoading) setLoading(false)
      }
    },
    [userId, cacheKey],
  )

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setProfile(null)

    if (!userId) {
      setLoading(false)
      return
    }

    ;(async () => {
      if (cacheKey) {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached && mounted) {
          setProfile(JSON.parse(cached) as Profile)
          setLoading(false)
          fetchFresh(false)
          return
        }
      }
      await fetchFresh(true)
    })()

    return () => {
      mounted = false
    }
  }, [userId, cacheKey, fetchFresh])

  return { profile, loading, error, refetch: fetchFresh }
}
