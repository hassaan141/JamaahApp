import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'

// Helper functions
const formatTime = (time: string | null) => {
  if (!time) return null
  try {
    const [hours, minutes] = time.split(':')
    if (!hours || !minutes) return time
    const hour = parseInt(hours, 10)
    const min = minutes.padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min} ${ampm}`
  } catch {
    return time
  }
}

const formatDaysOfWeek = (days: number[] | null) => {
  if (!days || days.length === 0) return null
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => dayNames[day - 1]).join(', ')
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null
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
    case 'Volunteering':
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
    case 'Volunteering':
      return '#805AD5'
    default:
      return '#2F855A'
  }
}

interface AnnouncementCardProps {
  announcement: OrgPost
  showEditButton?: boolean
  onEdit?: () => void
  showPublishedDate?: boolean
}

export default function AnnouncementCard({
  announcement,
  showEditButton = false,
  onEdit,
  showPublishedDate = true,
}: AnnouncementCardProps) {
  const eventColor = getEventTypeColor(announcement.post_type)
  const eventIcon = getEventTypeIcon(announcement.post_type)
  const startTime = formatTime(announcement.start_time)
  const endTime = formatTime(announcement.end_time)
  const recurringDays = formatDaysOfWeek(announcement.recurs_on_days)
  const eventDate = formatDate(announcement.date)

  // Debug logging
  console.log('[AnnouncementCard]', {
    title: announcement.title,
    date: announcement.date,
    eventDate,
    recurringDays,
    showDate: eventDate && !recurringDays,
  })

  return (
    <View style={styles.announcementCard}>
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
          <Text style={styles.announcementTitle}>{announcement.title}</Text>
          {showPublishedDate && announcement.created_at && (
            <Text style={styles.announcementPublished}>
              Published {formatDate(announcement.created_at)}
            </Text>
          )}

          {/* Event Type and Audience Badges */}
          <View style={styles.eventDetailsRow}>
            {announcement.post_type && (
              <View
                style={[
                  styles.eventBadge,
                  { backgroundColor: `${eventColor}15` },
                ]}
              >
                <Text style={[styles.eventBadgeText, { color: eventColor }]}>
                  {announcement.post_type === 'Repeating_classes'
                    ? 'Repeating'
                    : announcement.post_type === 'Volunteerng'
                      ? 'Volunteering'
                      : announcement.post_type}
                </Text>
              </View>
            )}
            {announcement.demographic && (
              <View style={[styles.eventBadge, { backgroundColor: '#F7FAFC' }]}>
                <Text style={[styles.eventBadgeText, { color: '#4A5568' }]}>
                  {announcement.demographic}
                </Text>
              </View>
            )}
          </View>

          {/* Event Date (for non-recurring events) */}
          {eventDate && !recurringDays && (
            <View style={styles.timeInfo}>
              <Feather
                name="calendar"
                size={12}
                color="#6B7280"
                style={styles.timeIcon}
              />
              <Text style={styles.timeText}>{eventDate}</Text>
            </View>
          )}

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
        {showEditButton && (
          <TouchableOpacity style={styles.smallIconButton} onPress={onEdit}>
            <Feather name="edit-3" size={16} color="#2F855A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {!!announcement.body && (
        <Text style={styles.announcementBody}>{announcement.body}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
})
