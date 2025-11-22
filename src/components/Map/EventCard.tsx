import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'

const getEventTypeIcon = (
  postType: string | null,
): React.ComponentProps<typeof Feather>['name'] => {
  switch (postType) {
    case 'Event':
      return 'calendar'
    case 'Repeating_classes':
      return 'book-open'
    case 'Janazah':
      return 'heart'
    case 'Volunteerng':
    case 'Volunteering':
      return 'users'
    default:
      return 'calendar'
  }
}

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

export default function EventCard({
  event,
  onPress,
  onDirections,
}: {
  event: OrgPost
  onPress?: () => void
  onDirections?: (event: OrgPost) => void
}) {
  const iconName = getEventTypeIcon(event.post_type)
  const iconColor = getEventTypeColor(event.post_type)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.typeIcon, { backgroundColor: iconColor }]}>
            <Feather name={iconName} size={12} color="white" />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.locationInfo}>
          <Feather name="map-pin" size={12} color="#718096" />
          <Text style={styles.location} numberOfLines={1}>
            {event.location || 'Location TBD'}
          </Text>
        </View>
      </View>

      <View style={styles.organizationRow}>
        <Feather name="users" size={12} color="#718096" />
        <Text style={styles.organizationText}>{event.organizations?.name}</Text>
      </View>

      {event.date && (
        <View style={styles.dateRow}>
          <Feather name="calendar" size={12} color="#718096" />
          <Text style={styles.dateText}>{event.date}</Text>
          {event.start_time && (
            <Text style={styles.timeText}>
              • {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={(e) => {
            e.stopPropagation()
            onDirections?.(event)
          }}
        >
          <Feather name="navigation" size={14} color="#FFFFFF" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
    flex: 1,
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  organizationText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  directionsButton: {
    backgroundColor: '#48BB78',
  },
  directionsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
})
