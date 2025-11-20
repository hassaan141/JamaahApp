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

// Helper functions
const formatTime = (time: string | null) => {
  if (!time) return null
  try {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return time
  }
}

const formatDaysOfWeek = (days: number[] | null) => {
  if (!days || days.length === 0) return null
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => dayNames[day - 1]).join(', ')
}

const getEventTypeIcon = (
  postType: string | null,
): React.ComponentProps<typeof Feather>['name'] => {
  switch (postType) {
    case 'Event':
      return 'calendar'
    case 'Repeating_classes':
      return 'repeat'
    case 'Janazah':
      return 'heart'
    case 'Volunteerng':
      return 'users'
    default:
      return 'calendar'
  }
}

const getEventTypeColor = (postType: string | null) => {
  switch (postType) {
    case 'Event':
      return '#2F855A'
    case 'Repeating_classes':
      return '#3182CE'
    case 'Janazah':
      return '#E53E3E'
    case 'Volunteerng':
      return '#805AD5'
    default:
      return '#2F855A'
  }
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

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
    announcementCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    announcementHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    eventIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    announcementHeading: {
      flex: 1,
      paddingRight: 10,
    },
    announcementTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1D4732',
      marginBottom: 3,
      lineHeight: 20,
    },
    announcementPublished: {
      fontSize: 11,
      color: '#6B7280',
      fontWeight: '500',
      marginBottom: 6,
    },
    eventDetailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 6,
    },
    eventBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 4,
      marginBottom: 3,
    },
    eventBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    timeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timeIcon: {
      marginRight: 4,
    },
    timeText: {
      fontSize: 12,
      color: '#4A5568',
      fontWeight: '500',
    },
    recurringDays: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    recurringIcon: {
      marginRight: 4,
    },
    recurringText: {
      fontSize: 12,
      color: '#4A5568',
      fontWeight: '500',
    },
    announcementBody: {
      fontSize: 13,
      color: '#4A5568',
      lineHeight: 18,
      marginTop: 2,
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
        announcements.map((item) => {
          const eventColor = getEventTypeColor(item.post_type)
          const eventIcon = getEventTypeIcon(item.post_type)
          const startTime = formatTime(item.start_time)
          const endTime = formatTime(item.end_time)
          const recurringDays = formatDaysOfWeek(item.recurs_on_days)

          return (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <View
                  style={[
                    styles.eventIconWrapper,
                    { backgroundColor: `${eventColor}15` },
                  ]}
                >
                  <Feather name={eventIcon} size={16} color={eventColor} />
                </View>
                <View style={styles.announcementHeading}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  {item.created_at && (
                    <Text style={styles.announcementPublished}>
                      Published {formatDate(item.created_at)}
                    </Text>
                  )}

                  {/* Event Type and Audience Badges */}
                  <View style={styles.eventDetailsRow}>
                    {item.post_type && (
                      <View
                        style={[
                          styles.eventBadge,
                          { backgroundColor: `${eventColor}15` },
                        ]}
                      >
                        <Text
                          style={[styles.eventBadgeText, { color: eventColor }]}
                        >
                          {item.post_type === 'Repeating_classes'
                            ? 'Repeating'
                            : item.post_type}
                        </Text>
                      </View>
                    )}
                    {item.demographic && (
                      <View
                        style={[
                          styles.eventBadge,
                          { backgroundColor: '#F7FAFC' },
                        ]}
                      >
                        <Text
                          style={[styles.eventBadgeText, { color: '#4A5568' }]}
                        >
                          {item.demographic}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Time Information */}
                  {(startTime || endTime) && (
                    <View style={styles.timeInfo}>
                      <Feather
                        name="clock"
                        size={12}
                        color="#6B7280"
                        style={styles.timeIcon}
                      />
                      <Text style={styles.timeText}>
                        {startTime && endTime
                          ? `${startTime} - ${endTime}`
                          : startTime || endTime}
                      </Text>
                    </View>
                  )}

                  {/* Recurring Days */}
                  {recurringDays && (
                    <View style={styles.recurringDays}>
                      <Feather
                        name="repeat"
                        size={12}
                        color="#6B7280"
                        style={styles.recurringIcon}
                      />
                      <Text style={styles.recurringText}>{recurringDays}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.smallIconButton}>
                  <Feather name="edit-3" size={16} color="#2F855A" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              {!!item.body && (
                <Text style={styles.announcementBody}>{item.body}</Text>
              )}
            </View>
          )
        })
      )}
    </View>
  )
}
