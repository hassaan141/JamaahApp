import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import {
  followOrganization,
  unfollowOrganization,
} from '@/Supabase/organizationFollow'

type Org = Record<string, unknown>

export default function OrganizationDetail() {
  const route = useRoute<RouteProp<Record<string, { org?: Org }>, string>>()
  const org = route.params?.org as Org | undefined
  const [following, setFollowing] = useState<boolean>(
    typeof org?.is_following === 'boolean' ? org!.is_following : false,
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // placeholder for potential follow-state sync
  }, [org])

  const toggleFollow = async () => {
    if (!org) return
    setLoading(true)
    try {
      if (following) {
        await unfollowOrganization(String(org.id))
        setFollowing(false)
      } else {
        await followOrganization(String(org.id))
        setFollowing(true)
      }
    } catch (e) {
      console.error('follow toggle error', e)
    } finally {
      setLoading(false)
    }
  }

  if (!org) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No organization provided</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{String(org.name ?? 'Organization')}</Text>
      <Text style={styles.subtitle}>{String(org.type ?? '')}</Text>
      <Text style={styles.description}>{String(org.description ?? '')}</Text>

      <View style={{ height: 16 }} />

      <TouchableOpacity
        style={[styles.followButton, following && styles.following]}
        onPress={toggleFollow}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.followText}>
            {following ? 'Following' : 'Follow'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#1D4732' },
  subtitle: { fontSize: 14, color: '#38A169', marginTop: 6 },
  description: { marginTop: 12, fontSize: 14, color: '#4A5568' },
  followButton: {
    marginTop: 24,
    backgroundColor: '#38A169',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  following: {
    backgroundColor: '#E3F5E9',
    borderWidth: 1,
    borderColor: '#38A169',
  },
  followText: { color: '#fff', fontWeight: '600' },
})
