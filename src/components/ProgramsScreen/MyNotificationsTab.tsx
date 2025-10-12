import React, { useState, useCallback, useEffect } from 'react'
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
} from 'react-native'
import MyNotificationItem from './MyNotificationItem'
import { fetchMyAnnouncements } from '@/Supabase/fetchMyAnnouncements'

export default function MyNotificationsTab() {
  const [refreshing, setRefreshing] = useState(false)
  const [announcements, setAnnouncements] = useState<Record<string, unknown>[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMyAnnouncements()
      const rows = Array.isArray(data) ? data : []
      setAnnouncements(rows)
    } catch (_e) {
      console.error('loadMyAnnouncements error', _e)
      setError('Failed to load announcements')
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadAnnouncements()
    } finally {
      setRefreshing(false)
    }
  }, [loadAnnouncements])

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#38A169" />
        <Text style={{ marginTop: 12, color: '#1D4732', fontSize: 15 }}>
          Loading announcements...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: 'red', fontSize: 15 }}>{error}</Text>
      </View>
    )
  }

  if (!announcements.length) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
          No announcements yet
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {announcements.map((post) => {
        const p = post as Record<string, unknown>
        const id = String(p.id ?? '')
        const created_at = String(p.created_at ?? '')
        const title = String(p.title ?? '')
        const body = typeof p.body === 'string' ? (p.body as string) : undefined
        return (
          <MyNotificationItem
            key={id}
            notification={{
              id,
              time: created_at,
              title,
              description: body,
              isNew: false,
            }}
          />
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
})
