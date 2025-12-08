import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'
import AnnouncementModal from './AnnouncementModal'
import {
  formatTime,
  formatDaysOfWeek,
  chunkIntoPairs,
  formatDate,
  getEventTypeIcon,
  getEventTypeColor,
} from './announcementUtils'

interface AnnouncementCardProps {
  announcement: OrgPost & { organizations?: { name?: string } | null }
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
  const [expanded, setExpanded] = useState(false)
  const [textOverflowing, setTextOverflowing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const eventColor = getEventTypeColor(announcement.post_type)
  const eventIcon = getEventTypeIcon(announcement.post_type)
  const startTime = formatTime(announcement.start_time)
  const endTime = formatTime(announcement.end_time)
  const recurringDays = formatDaysOfWeek(announcement.recurs_on_days)
  const recurringDayRows = chunkIntoPairs(recurringDays)
  const eventDate = formatDate(announcement.date)

  useEffect(() => {
    // reset when announcement changes; initialize overflow based on length
    setExpanded(false)
    setTextOverflowing(
      Boolean(announcement.body && announcement.body.length > 200),
    )
  }, [announcement.body])

  return (
    <>
      <TouchableOpacity
        style={styles.announcementCard}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
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
            <View style={styles.titleRow}>
              <View style={styles.leftContent}>
                <Text style={styles.announcementTitle}>
                  {announcement.title}
                </Text>
                {announcement.organizations?.name && (
                  <Text style={styles.organizationName}>
                    {announcement.organizations.name}
                  </Text>
                )}
                <View style={styles.eventDetailsRow}>
                  {announcement.post_type && (
                    <View
                      style={[
                        styles.eventBadge,
                        { backgroundColor: `${eventColor}15` },
                      ]}
                    >
                      <Text
                        style={[styles.eventBadgeText, { color: eventColor }]}
                      >
                        {announcement.post_type === 'Repeating_classes'
                          ? 'Classes'
                          : announcement.post_type === 'Volunteerng'
                            ? 'Volunteering'
                            : announcement.post_type}
                      </Text>
                    </View>
                  )}
                  {announcement.demographic && (
                    <View
                      style={[
                        styles.eventBadge,
                        { backgroundColor: '#F7FAFC' },
                      ]}
                    >
                      <Text
                        style={[styles.eventBadgeText, { color: '#4A5568' }]}
                      >
                        {announcement.demographic}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.rightContent}>
                {eventDate && !recurringDays && (
                  <Text style={styles.dateText}>{eventDate}</Text>
                )}
                {(startTime || endTime) && (
                  <Text style={styles.timeText}>
                    {startTime && endTime
                      ? `${startTime} - ${endTime}`
                      : startTime || endTime}
                  </Text>
                )}
                {recurringDayRows &&
                  recurringDayRows.map((row, idx) => (
                    <Text
                      key={idx}
                      style={styles.recurringText}
                      numberOfLines={2}
                    >
                      {row}
                    </Text>
                  ))}
                {showPublishedDate && announcement.created_at && (
                  <Text style={styles.announcementPublished}>
                    {formatDate(announcement.created_at)}
                  </Text>
                )}
              </View>
            </View>
          </View>
          {showEditButton && (
            <TouchableOpacity style={styles.smallIconButton} onPress={onEdit}>
              <Feather name="edit-3" size={16} color="#2F855A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {!!announcement.body && (
          <>
            <Text
              style={styles.announcementBody}
              numberOfLines={expanded ? undefined : 2}
              onTextLayout={(e) => {
                // only consider overflow when collapsed
                if (!expanded) {
                  setTextOverflowing(e.nativeEvent.lines.length > 2)
                }
              }}
            >
              {announcement.body}
            </Text>
            {textOverflowing && (
              <TouchableOpacity
                onPress={() => setExpanded((s) => !s)}
                activeOpacity={0.7}
              >
                <Text style={styles.readMore}>
                  {expanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </TouchableOpacity>

      <AnnouncementModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        announcement={announcement}
        showPublishedDate={showPublishedDate}
      />
    </>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 2,
    lineHeight: 20,
  },
  organizationName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    marginTop: 2,
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
  dateText: {
    fontSize: 12,
    color: '#1D4732',
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
    display: 'flex',
  },
  timeText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 2,
  },
  recurringText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 2,
  },
  announcementPublished: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'right',
  },
  announcementBody: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
    marginTop: 2,
  },
  readMore: {
    marginTop: 6,
    fontSize: 13,
    color: '#3182CE',
    fontWeight: '600',
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
