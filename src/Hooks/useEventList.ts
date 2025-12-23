import { useState, useRef, useEffect, useCallback } from 'react'
import type { EventItem } from '@/Supabase/fetchEventsFromRPC';
import { fetchNearbyEvents } from '@/Supabase/fetchEventsFromRPC'

const EVENT_FETCH_LIMIT = 20

export function useEventList(
  location?: { latitude: number; longitude: number } | null,
) {
  const [events, setEvents] = useState<EventItem[]>([])

  const [loading, setLoading] = useState(true)

  const [fetchingMore, setFetchingMore] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEvents = useCallback(
    async (query = '', isLoadMore = false) => {
      if (!location) {
        setLoading(false)
        return
      }

      if (isLoadMore) {
        setFetchingMore(true)
      } else {
        setLoading(true)
        offsetRef.current = 0
      }

      setError(null)

      try {
        const list = await fetchNearbyEvents(
          location.latitude,
          location.longitude,
          {
            query: query,
            limit: EVENT_FETCH_LIMIT,
            offset: offsetRef.current,
          },
        )

        if (isLoadMore) {
          setEvents((prev) => [...prev, ...list])
        } else {
          setEvents(list)
        }

        setHasMore(list.length === EVENT_FETCH_LIMIT)

        offsetRef.current += EVENT_FETCH_LIMIT
      } catch (err) {
        console.error('[useEventList] Fetch nearby events error:', err)
        setError('Failed to fetch events.')
      } finally {
        setLoading(false)
        setFetchingMore(false)
        setRefreshing(false)
      }
    },
    [location],
  )

  useEffect(() => {
    fetchEvents('')
  }, [location, fetchEvents])

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    if (!location) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchEvents(text, false)
    }, 300)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    fetchEvents('')
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchEvents(searchQuery, false)
  }

  const loadMore = () => {
    if (!loading && !fetchingMore && hasMore) {
      fetchEvents(searchQuery, true)
    }
  }

  return {
    events,
    loading,
    fetchingMore,
    error,
    refreshing,
    searchQuery,
    hasMore,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    onRefresh,
    loadMore,
  }
}
