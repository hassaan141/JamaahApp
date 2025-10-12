import { useState, useRef, useEffect, useCallback } from 'react'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'

const MASJID_FETCH_LIMIT = 20

export type MasjidItem = {
  id: string
  name: string
  address?: string
  city?: string
  province_state?: string | null
  country?: string | null
  latitude?: number
  longitude?: number
  distance_km?: number
  contact_phone?: string | null
  phone?: string | null
  [key: string]: unknown
}

export function useMasjidList(
  location?: { latitude: number; longitude: number } | null,
) {
  const [masjids, setMasjids] = useState<MasjidItem[]>([])
  const [filteredMasjids, setFilteredMasjids] = useState<MasjidItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef = useRef<number | null>(null)

  const fetchMasjids = useCallback(
    async (query = '') => {
      if (!location) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const list = await fetchNearbyMasjids(
          location.latitude,
          location.longitude,
          {
            q: query,
            limit: MASJID_FETCH_LIMIT,
          },
        )
        setMasjids(list as MasjidItem[])
        setFilteredMasjids(list as MasjidItem[])
      } catch {
        setError('Failed to fetch masjids. Please try again later.')
      } finally {
        setLoading(false)
      }
    },
    [location],
  )

  useEffect(() => {
    fetchMasjids('')
  }, [location, fetchMasjids])

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    if (!location) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setError(null)
      try {
        const list = await fetchNearbyMasjids(
          location.latitude,
          location.longitude,
          {
            q: text,
            limit: MASJID_FETCH_LIMIT,
          },
        )
        setMasjids(list as MasjidItem[])
        setFilteredMasjids(list as MasjidItem[])
      } catch {
        setError('Search failed. Please try again.')
      }
    }, 300)
  }

  const handleClearSearch = async () => {
    setSearchQuery('')
    fetchMasjids('')
  }

  const onRefresh = async () => {
    if (!location) return
    setRefreshing(true)
    setError(null)
    try {
      const list = await fetchNearbyMasjids(
        location.latitude,
        location.longitude,
        {
          q: searchQuery,
          limit: MASJID_FETCH_LIMIT,
        },
      )
      setMasjids(list as MasjidItem[])
      setFilteredMasjids(list as MasjidItem[])
    } catch {
      setError('Failed to refresh masjids. Please try again later.')
    } finally {
      setRefreshing(false)
    }
  }

  return {
    masjids,
    filteredMasjids,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    onRefresh,
  }
}
