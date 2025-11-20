import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import TitleInput from './CreateAnnouncements/TitleInput'
import TypeSelector from './CreateAnnouncements/TypeSelector'
import ScheduleSection from './CreateAnnouncements/ScheduleSection'
import TimeInputSection from './CreateAnnouncements/TimeInputSection'
import AudienceSelector from './CreateAnnouncements/AudienceSelector'
import DescriptionInput from './CreateAnnouncements/DescriptionInput'
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
  demographic: string | null
  setDemographic: (v: string | null) => void
  posting: boolean
  handlePostAnnouncement: () => Promise<void> | void
}) {
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

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
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            paddingTop: 16,
            width: '100%',
            maxWidth: 400,
            maxHeight: 600,
            overflow: 'hidden',
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
              color="#2F855A"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 20, fontWeight: '600', color: '#1D4732' }}
              >
                New Announcement
              </Text>
              <Text style={{ fontSize: 13, color: '#6C757D', marginTop: 2 }}>
                Share updates with your community
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6C757D" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator
          >
            {/* Components in the specified order: title, type, schedule, start/end time, audience, description */}

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
              }}
              onPress={onClose}
            >
              <Text
                style={{ color: '#6C757D', fontWeight: '600', fontSize: 15 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#2F855A',
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
