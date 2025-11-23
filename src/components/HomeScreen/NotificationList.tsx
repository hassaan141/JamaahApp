import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import { isNewAnnouncement } from '@/Utils/datetime'
import {
  fetchMyAnnouncements,
  type Announcement,
} from '@/Supabase/fetchMyAnnouncements'

const NotificationList: React.FC<{ refreshKey?: boolean }> = ({
  refreshKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    console.log('[NotificationList] refreshKey changed:', refreshKey)
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchMyAnnouncements()
        console.log(
          '[NotificationList] fetched announcements count:',
          (data ?? []).length,
        )
        if (mounted) setAnnouncements(data ?? [])
      } catch {
        if (mounted) setAnnouncements([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [refreshKey])

  const visibleAnnouncements = isExpanded
    ? announcements
    : announcements.slice(0, 2)
  const hiddenCount = Math.max(0, announcements.length - 2)
  const newAnnouncementCount = announcements.filter((a) =>
    isNewAnnouncement(a.created_at),
  ).length

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="bell" size={16} color="#4A5568" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        {newAnnouncementCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{newAnnouncementCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.notificationList}>
        {loading ? (
          <Text>Loading...</Text>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Feather
              name="plus-circle"
              size={40}
              color="#48BB78"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Please start following an organization to get events and classes
            </Text>
          </View>
        ) : (
          <>
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                showEditButton={false}
                showPublishedDate={false}
              />
            ))}
            {!isExpanded && hiddenCount > 0 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsExpanded(true)}
              >
                <Text style={styles.expandButtonText}>
                  +{hiddenCount} more notifications
                </Text>
              </TouchableOpacity>
            )}
            {isExpanded && (
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => setIsExpanded(false)}
              >
                <Text style={styles.collapseButtonText}>Show less</Text>
                <Feather name="chevron-up" size={16} color="#718096" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationList: {
    gap: 12,
  },
  expandButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '500',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 4,
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF00',
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4A5568',
    maxWidth: 260,
  },
})

export default NotificationList
