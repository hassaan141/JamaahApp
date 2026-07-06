import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import TitleInput from './CreateAnnouncements/TitleInput'
import TypeSelector from './CreateAnnouncements/TypeSelector'
import ScheduleSection from './CreateAnnouncements/ScheduleSection'
import TimeInputSection from './CreateAnnouncements/TimeInputSection'
import AudienceSelector from './CreateAnnouncements/AudienceSelector'
import DescriptionInput from './CreateAnnouncements/DescriptionInput'
import LocationSelector from './CreateAnnouncements/LocationSelector'
import type { Demographic, Organization } from '@/types'
import { useTheme } from '@/theme'

export default function AnnouncementModal({
  visible,
  onClose,
  announcementTitle,
  setAnnouncementTitle,
  announcementBody,
  setAnnouncementBody,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  recurringDays,
  setRecurringDays,
  date,
  setDate,
  postType,
  setPostType,
  demographic,
  setDemographic,
  organization,
  setLocationData,
  posting,
  handlePostAnnouncement,
}: {
  visible: boolean
  onClose: () => void
  announcementTitle: string
  setAnnouncementTitle: (v: string) => void
  announcementBody: string
  setAnnouncementBody: (v: string) => void
  startTime: string | null
  setStartTime: (v: string | null) => void
  endTime: string | null
  setEndTime: (v: string | null) => void
  recurringDays: number[]
  setRecurringDays: (days: number[]) => void
  date?: string | null
  setDate?: (d: string | null) => void
  postType: string | null
  setPostType: (v: string | null) => void
  demographic: Demographic | null
  setDemographic: (v: Demographic | null) => void
  organization?: Organization | null
  locationData?: {
    address: string
    lat?: number | null
    lng?: number | null
    isCurrentAddress?: boolean
  } | null
  setLocationData?: (
    d: {
      address: string
      lat?: number | null
      lng?: number | null
      isCurrentAddress?: boolean
    } | null,
  ) => void
  posting: boolean
  handlePostAnnouncement: () => Promise<void> | void
}) {
  const { theme } = useTheme()
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const handleLocationChange = React.useCallback(
    (loc: {
      address: string
      lat?: number | null
      lng?: number | null
      isCurrentAddress?: boolean
    }) => {
      setLocationData?.(loc)
    },
    [setLocationData],
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            paddingTop: 16,
            width: '100%',
            maxWidth: 400,
            maxHeight: 600,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Feather
              name="volume-2"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}
              >
                New Announcement
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  marginTop: 2,
                }}
              >
                Share updates with your community
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator
          >
            <TitleInput
              title={announcementTitle}
              setTitle={setAnnouncementTitle}
            />

            <TypeSelector postType={postType} setPostType={setPostType} />

            <ScheduleSection
              postType={postType}
              recurringDays={recurringDays}
              setRecurringDays={setRecurringDays}
              date={date}
              setDate={setDate}
            />

            <TimeInputSection
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              showStartPicker={showStartPicker}
              setShowStartPicker={setShowStartPicker}
              showEndPicker={showEndPicker}
              setShowEndPicker={setShowEndPicker}
            />

            <AudienceSelector
              demographic={demographic}
              setDemographic={setDemographic}
            />

            <LocationSelector
              orgAddress={organization?.address ?? undefined}
              orgLat={organization?.latitude ?? undefined}
              orgLng={organization?.longitude ?? undefined}
              onLocationChange={handleLocationChange}
            />

            <DescriptionInput
              description={announcementBody}
              setDescription={setAnnouncementBody}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 8,
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginRight: 10,
                backgroundColor: theme.colors.surfaceMuted,
              }}
              onPress={onClose}
            >
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontWeight: '600',
                  fontSize: 15,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                opacity: posting ? 0.6 : 1,
              }}
              onPress={handlePostAnnouncement}
              disabled={posting}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}
              >
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
