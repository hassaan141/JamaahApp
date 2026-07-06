import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { EventItem } from '@/Supabase/fetchEventsFromRPC'
import type { OrgPost } from '@/types'
import AnnouncementModal from '@/components/Shared/AnnouncementModal'
import { useTheme } from '@/theme'
import { useDistanceUnit } from '@/preferences'
import { formatDistanceFromKm } from '@/Utils/distance'
import { formatTime } from '@/Utils/datetime'
import {
  formatDaysOfWeek,
  getEventTypeColor,
  getEventTypeIcon,
} from '@/components/Shared/announcementUtils'

/**
 * Extended type to handle recurring days and organization name
 * as returned by the updated Supabase RPC.
 */
type EventWithExtras = EventItem & {
  recurs_on_days?: (string | number)[] | null
  organization_name?: string | null
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

export default function EventCard({
  event,
  onDirections,
}: {
  event: EventItem
  onPress?: () => void
  onDirections?: (event: EventItem) => void
}) {
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()
  const [modalVisible, setModalVisible] = useState(false)
  const iconName = getEventTypeIcon(event.post_type)
  const iconColor = getEventTypeColor(event.post_type)
  const isRepeating = event.post_type === 'Repeating_classes'

  const recurringDisplay = (() => {
    if (!isRepeating) return ''
    const days = (event as EventWithExtras).recurs_on_days
    return formatDaysOfWeek(days ?? null, 'long')?.join(', ') ?? ''
  })()

  const announcementData: OrgPost & {
    organizations?: { name?: string } | null
  } = {
    id: event.id,
    organization_id: event.organization_id,
    author_profile_id: null,
    title: event.title,
    body: event.body,
    post_type: event.post_type,
    demographic: event.demographic,
    recurs_on_days:
      ((event as EventWithExtras).recurs_on_days?.map((d) =>
        typeof d === 'string' ? parseInt(d, 10) : d,
      ) as number[] | null) ?? null,
    start_time: event.start_time,
    end_time: event.end_time,
    date: event.date,
    send_push: false,
    created_at: '',
    location: event.location,
    lat: event.lat,
    long: event.long,
    organizations: { name: (event as EventWithExtras).organization_name ?? '' },
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        {/* Title Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.typeIcon, { backgroundColor: iconColor }]}>
              <Feather name={iconName} size={12} color="white" />
            </View>
            <Text
              style={[styles.title, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {event.title}
            </Text>
          </View>
        </View>

        {/* 1. Organization Row (Moved before Address) */}
        {(event as EventWithExtras).organization_name && (
          <View style={styles.organizationRow}>
            <Feather name="users" size={12} color={theme.colors.textSoft} />
            <Text
              style={[
                styles.organizationText,
                { color: theme.colors.textMuted },
              ]}
            >
              {(event as EventWithExtras).organization_name}
            </Text>
          </View>
        )}

        {/* 2. Location Row: Address (Left) and Distance (Right) */}
        <View style={styles.splitInfoRow}>
          <View style={styles.leftContainer}>
            <Feather name="map-pin" size={12} color={theme.colors.textSoft} />
            <Text
              style={[styles.infoText, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              {event.location || 'Location TBD'}
            </Text>
          </View>
          {event.dist_km != null && (
            <Text
              style={[
                styles.rightHighlightText,
                { color: theme.colors.primary },
              ]}
            >
              {formatDistanceFromKm(event.dist_km, unit)}
            </Text>
          )}
        </View>

        {/* 3. Date & Time Row: Time (Left) and Formatted Date (Right) */}
        {(event.date || recurringDisplay || event.start_time) && (
          <View style={styles.splitInfoRow}>
            <View style={styles.leftContainer}>
              <Feather name="clock" size={12} color={theme.colors.textSoft} />
              {event.start_time ? (
                <Text
                  style={[styles.infoText, { color: theme.colors.textMuted }]}
                >
                  {formatTime(event.start_time, '', null)}
                  {event.end_time
                    ? ` - ${formatTime(event.end_time, '', null)}`
                    : ''}
                </Text>
              ) : (
                <Text
                  style={[styles.infoText, { color: theme.colors.textMuted }]}
                >
                  Time TBD
                </Text>
              )}
            </View>
            {(recurringDisplay || event.date) && (
              <Text
                style={[
                  styles.rightNormalText,
                  { color: theme.colors.textMuted },
                ]}
              >
                {recurringDisplay || formatLegibleDate(event.date)}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.directionsButton,
              { backgroundColor: theme.colors.primary },
            ]}
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

      <AnnouncementModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        announcement={announcementData}
        showPublishedDate={false}
      />
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    marginLeft: 6,
  },
  rightHighlightText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightNormalText: {
    fontSize: 13,
    fontWeight: '500',
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  organizationText: {
    fontSize: 13,
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
  directionsButton: {},
  directionsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
})
