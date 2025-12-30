import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { EventItem } from '@/Supabase/fetchEventsFromRPC'

/**
 * Extended type to handle recurring days and organization name
 * as returned by the updated Supabase RPC.
 */
type EventWithExtras = EventItem & {
  recurs_on_days?: (string | number)[] | null
  organization_name?: string | null
}

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

/**
 * Converts a standard date string (YYYY-MM-DD) into
 * a legible format: "26 December 2025"
 */
const formatLegibleDate = (dateStr: string | null) => {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
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
  event: EventItem
  onPress?: () => void
  onDirections?: (event: EventItem) => void
}) {
  const iconName = getEventTypeIcon(event.post_type)
  const iconColor = getEventTypeColor(event.post_type)
  const isRepeating = event.post_type === 'Repeating_classes'

  const recurringDisplay = (() => {
    if (!isRepeating) return ''
    const days = (event as EventWithExtras).recurs_on_days
    if (!days || days.length === 0) return ''
    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]
    const names = (days as (string | number)[])
      .map((d) => {
        const n = typeof d === 'string' ? parseInt(d, 10) : Number(d)
        if (!Number.isFinite(n) || n < 1 || n > 7) return null
        return dayNames[n - 1]
      })
      .filter(Boolean) as string[]
    return names.join(', ')
  })()

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Title Header */}
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

      {/* 1. Organization Row (Moved before Address) */}
      {(event as EventWithExtras).organization_name && (
        <View style={styles.organizationRow}>
          <Feather name="users" size={12} color="#718096" />
          <Text style={styles.organizationText}>
            {(event as EventWithExtras).organization_name}
          </Text>
        </View>
      )}

      {/* 2. Location Row: Address (Left) and Distance (Right) */}
      <View style={styles.splitInfoRow}>
        <View style={styles.leftContainer}>
          <Feather name="map-pin" size={12} color="#718096" />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location || 'Location TBD'}
          </Text>
        </View>
        {event.dist_km != null && (
          <Text style={styles.rightHighlightText}>
            {event.dist_km.toFixed(1)} km
          </Text>
        )}
      </View>

      {/* 3. Date & Time Row: Time (Left) and Formatted Date (Right) */}
      {(event.date || recurringDisplay || event.start_time) && (
        <View style={styles.splitInfoRow}>
          <View style={styles.leftContainer}>
            <Feather name="clock" size={12} color="#718096" />
            {event.start_time ? (
              <Text style={styles.infoText}>
                {formatTime(event.start_time)}
                {event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
              </Text>
            ) : (
              <Text style={styles.infoText}>Time TBD</Text>
            )}
          </View>
          {(recurringDisplay || event.date) && (
            <Text style={styles.rightNormalText}>
              {recurringDisplay || formatLegibleDate(event.date)}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // --- Changes Start Here ---
    borderWidth: 1,
    borderColor: '#E2E8F0', // Adds a very light gray border for a clean edge
    shadowColor: '#4A5568', // Using a softer, less intense shadow color
    shadowOffset: { width: 0, height: 4 }, // Increases the shadow's downward distance
    shadowOpacity: 0.1, // Makes the shadow slightly more visible
    shadowRadius: 10, // Blurs and spreads the shadow for a softer "lifted" look
    elevation: 5, // Matches the shadow intensity for Android
    // --- Changes End Here ---
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
    marginRight: 10,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    lineHeight: 20,
  },
  splitInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 6,
  },
  rightHighlightText: {
    fontSize: 13,
    fontWeight: '600',
    // color: '#48BB78', // Changed to green
    color: '#718096',
  },
  rightNormalText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  organizationText: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  directionsButton: {
    backgroundColor: '#48BB78',
  },
  directionsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
})
