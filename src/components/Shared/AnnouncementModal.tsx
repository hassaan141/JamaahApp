import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'
import {
  formatDaysOfWeek,
  chunkIntoPairs,
  formatDate,
  getEventTypeIcon,
  getEventTypeColor,
} from './announcementUtils'
import { useTheme } from '@/theme'
import { formatTime } from '@/Utils/datetime'

interface AnnouncementModalProps {
  visible: boolean
  onClose: () => void
  announcement: OrgPost & { organizations?: { name?: string } | null }
  showPublishedDate?: boolean
}

export default function AnnouncementModal({
  visible,
  onClose,
  announcement,
  showPublishedDate = true,
}: AnnouncementModalProps) {
  const { theme } = useTheme()
  const eventColor = getEventTypeColor(announcement.post_type)
  const eventIcon = getEventTypeIcon(announcement.post_type)
  const startTime = formatTime(announcement.start_time, '', null)
  const endTime = formatTime(announcement.end_time, '', null)
  const recurringDays = formatDaysOfWeek(announcement.recurs_on_days)
  const recurringDayRows = chunkIntoPairs(recurringDays)
  const eventDate = formatDate(announcement.date)

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.borderSoft,
              },
            ]}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${eventColor}15` },
                ]}
              >
                <Feather name={eventIcon} size={24} color={eventColor} />
              </View>

              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {announcement.title}
                </Text>
                {announcement.organizations?.name && (
                  <Text
                    style={[styles.orgName, { color: theme.colors.textMuted }]}
                  >
                    {announcement.organizations.name}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.badgesRow}>
              {announcement.post_type && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: `${eventColor}15`,
                      borderColor: 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: eventColor,
                        textShadowColor: 'transparent',
                      },
                    ]}
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
                    styles.badge,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {announcement.demographic}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.detailsSection,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              {eventDate && !recurringDays && (
                <View style={styles.detailRow}>
                  <Feather
                    name="calendar"
                    size={16}
                    color={theme.colors.textSoft}
                    style={styles.detailIcon}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {eventDate}
                  </Text>
                </View>
              )}

              {(startTime || endTime) && (
                <View style={styles.detailRow}>
                  <Feather
                    name="clock"
                    size={16}
                    color={theme.colors.textSoft}
                    style={styles.detailIcon}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {startTime && endTime
                      ? `${startTime} - ${endTime}`
                      : startTime || endTime}
                  </Text>
                </View>
              )}

              {recurringDayRows &&
                recurringDayRows.map((row, idx) => (
                  <View key={idx} style={styles.detailRow}>
                    <Feather
                      name="repeat"
                      size={16}
                      color={theme.colors.textSoft}
                      style={styles.detailIcon}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      {row}
                    </Text>
                  </View>
                ))}

              {!!announcement.location && (
                <View style={styles.detailRow}>
                  <Feather
                    name="map-pin"
                    size={16}
                    color={theme.colors.textSoft}
                    style={styles.detailIcon}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: theme.colors.textMuted, flex: 1 },
                    ]}
                  >
                    {announcement.location}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.border }]}
            />

            {!!announcement.body && (
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                {announcement.body}
              </Text>
            )}

            {showPublishedDate && announcement.created_at && (
              <Text
                style={[styles.footerText, { color: theme.colors.textSoft }]}
              >
                Posted on {formatDate(announcement.created_at)}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalScrollContent: {
    paddingTop: 8,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 30, // Space for close button
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
    lineHeight: 28,
  },
  orgName: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
