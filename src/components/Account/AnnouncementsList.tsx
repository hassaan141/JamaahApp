import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { Profile, OrgPost } from '@/types'
import { fetchMyOrgPosts } from '@/Supabase/fetchMyOrgPosts'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'

export default function AnnouncementsList({
  profile,
  refreshKey,
}: {
  profile: Partial<Profile> | null
  refreshKey?: boolean
}) {
  const [announcements, setAnnouncements] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!profile?.org_id) return
      setLoading(true)
      try {
        const postsData = await fetchMyOrgPosts()
        setAnnouncements(postsData)
      } catch (error) {
        console.error('[AnnouncementsList] Failed to load announcements', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnnouncements()
  }, [profile?.org_id, refreshKey])

  const styles = StyleSheet.create({
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      marginRight: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1D4732',
    },
    sectionSubtitle: {
      fontSize: 13,
      color: '#6C757D',
      marginTop: 2,
    },

    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    loadingText: {
      color: '#6C757D',
      marginTop: 12,
      fontSize: 14,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F855A" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    )
  }

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Feather
          name="volume-2"
          size={20}
          color="#2F855A"
          style={styles.sectionIcon}
        />
        <View>
          <Text style={styles.sectionTitle}>Your Announcements</Text>
          <Text style={styles.sectionSubtitle}>
            Review what your community sees
          </Text>
        </View>
      </View>

      {announcements.length === 0 ? (
        <Text
          style={{ color: '#6C757D', textAlign: 'center', paddingVertical: 20 }}
        >
          No announcements yet
        </Text>
      ) : (
        announcements.map((item) => (
          <AnnouncementCard
            key={item.id}
            announcement={item}
            showEditButton
            showPublishedDate
          />
        ))
      )}
    </View>
  )
}
