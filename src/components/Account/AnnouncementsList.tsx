import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { Profile, OrgPost } from '@/types'
import { fetchMyOrgPosts } from '@/Supabase/fetchMyOrgPosts'

export default function AnnouncementsList({
  profile,
}: {
  profile: Partial<Profile> | null
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
  }, [profile?.org_id])

  const styles = StyleSheet.create({
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
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
    announcementCard: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 14,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: '#2F855A',
    },
    announcementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    announcementHeading: {
      flex: 1,
      paddingRight: 10,
    },
    announcementTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1D4732',
      marginBottom: 4,
    },
    announcementPublished: {
      fontSize: 12,
      color: '#6C757D',
    },
    announcementBody: {
      fontSize: 14,
      color: '#495057',
      lineHeight: 20,
    },
    smallIconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
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
          <View key={item.id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementHeading}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                {item.created_at && (
                  <Text style={styles.announcementPublished}>
                    {item.created_at}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.smallIconButton}>
                <Feather name="edit-3" size={16} color="#2F855A" />
              </TouchableOpacity>
            </View>
            {!!item.body && (
              <Text style={styles.announcementBody}>{item.body}</Text>
            )}
          </View>
        ))
      )}
    </View>
  )
}
