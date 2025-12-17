import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import { isNewAnnouncement } from '@/Utils/datetime'
import {
  fetchMyAnnouncements,
  type Announcement,
} from '@/Supabase/fetchMyAnnouncements'
import { useNavigation } from '@react-navigation/native'

const NotificationList: React.FC<{ refreshKey?: boolean }> = ({
  refreshKey,
}) => {
  const navigation = useNavigation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.95))[0]
  const didFetchRef = React.useRef(false)

  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true

    let mounted = true

    const fetchData = async () => {
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
    }

    fetchData()

    return () => {
      mounted = false
      didFetchRef.current = false
    }
  }, [refreshKey])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: loading ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: loading ? 0.95 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [loading, fadeAnim, scaleAnim])

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
  }

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
          <Text style={styles.headerTitle}>My Events</Text>
        </View>
        {newAnnouncementCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{newAnnouncementCount}</Text>
          </View>
        )}
      </View>

      <Animated.View
        style={[
          styles.notificationList,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {loading ? (
          <Text>Loading...</Text>
        ) : announcements.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyStateContainer}
            onPress={() => navigation.navigate('Organization' as never)}
            activeOpacity={0.7}
          >
            <Feather
              name="plus-circle"
              size={40}
              color="#48BB78"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Please start following an organization to get events and classes
            </Text>
          </TouchableOpacity>
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
                onPress={handleExpand}
                activeOpacity={0.7}
              >
                <Text style={styles.expandButtonText}>
                  +{hiddenCount} more notifications
                </Text>
              </TouchableOpacity>
            )}
            {isExpanded && (
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={handleCollapse}
                activeOpacity={0.7}
              >
                <Text style={styles.collapseButtonText}>Show less</Text>
                <Feather name="chevron-up" size={16} color="#718096" />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
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
