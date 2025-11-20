import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

function TimeInput({
  label,
  time,
  setTime,
  isOpen,
  onToggle,
}: {
  label: string
  time: string | null
  setTime: (t: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const displayTime = time
    ? new Date(`2000-01-01T${time}:00`).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Select Time'

  const handleChange = (event: unknown, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      onToggle()
    }
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0')
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={{
          backgroundColor: isOpen ? '#F0FFF4' : '#F8F9FA',
          borderColor: isOpen ? '#2F855A' : '#DEE2E6',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginBottom: isOpen ? 4 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: isOpen ? 'rgba(47, 133, 90, 0.1)' : '#E9ECEF',
              borderRadius: 6,
              padding: 6,
              marginRight: 10,
            }}
          >
            <Feather
              name="clock"
              size={16}
              color={isOpen ? '#2F855A' : '#6C757D'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                color: '#6C757D',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#1D4732',
                marginTop: 2,
              }}
            >
              {displayTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E9ECEF',
            overflow: 'hidden',
            marginBottom: 12,
            height: 130,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <DateTimePicker
            value={time ? new Date(`2000-01-01T${time}:00`) : new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            textColor="#1D4732"
            accentColor="#2F855A"
            style={{
              width: 320,
              marginLeft: -10,
              transform: [{ scale: 0.55 }],
            }}
          />
        </View>
      )}
    </View>
  )
}

function DaySelector({
  selectedDays,
  setSelectedDays,
}: {
  selectedDays: number[]
  setSelectedDays: (days: number[]) => void
}) {
  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 7 },
  ]

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue))
    } else {
      setSelectedDays([...selectedDays, dayValue].sort())
    }
  }

  return (
    <View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#1D4732',
          marginBottom: 10,
        }}
      >
        Recurring Days
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day) => {
          const isSelected = selectedDays.includes(day.value)
          return (
            <TouchableOpacity
              key={day.value}
              onPress={() => toggleDay(day.value)}
              style={{
                backgroundColor: isSelected ? '#2F855A' : '#F8F9FA',
                borderColor: isSelected ? '#2F855A' : '#DEE2E6',
                borderWidth: 1,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                marginBottom: 8,
                minWidth: 50,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#FFFFFF' : '#1D4732',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// --- MAIN COMPONENT ---
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
            maxHeight: 600, // Increased slightly to fit pickers if open
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
            {/* Title Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                }}
              >
                Title
              </Text>
              <TextInput
                value={announcementTitle}
                onChangeText={setAnnouncementTitle}
                placeholder="E.g. Ramadan night program"
                placeholderTextColor="#6C757D"
                style={{
                  backgroundColor: '#F8F9FA',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#DEE2E6',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 15,
                  color: '#1D4732',
                }}
              />
            </View>

            {/* Details Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                }}
              >
                Details
              </Text>
              <TextInput
                value={announcementBody}
                onChangeText={setAnnouncementBody}
                placeholder="Add timing, location, or supporting notes"
                placeholderTextColor="#6C757D"
                style={{
                  backgroundColor: '#F8F9FA',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#DEE2E6',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 15,
                  color: '#1D4732',
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* SCHEDULE SECTION */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 10,
                }}
              >
                Schedule (optional)
              </Text>

              {/* Conditional rendering based on post type */}
              {postType === 'Repeating_classes' && (
                <View style={{ marginBottom: 12 }}>
                  <DaySelector
                    selectedDays={recurringDays}
                    setSelectedDays={setRecurringDays}
                  />
                </View>
              )}

              {/* Time Inputs */}
              <View style={{ flexDirection: 'row' }}>
                <TimeInput
                  label="Start Time"
                  time={startTime}
                  setTime={setStartTime}
                  isOpen={showStartPicker}
                  onToggle={() => {
                    setShowStartPicker(!showStartPicker)
                    setShowEndPicker(false)
                  }}
                />

                <View style={{ width: 10 }} />

                <TimeInput
                  label="End Time"
                  time={endTime}
                  setTime={setEndTime}
                  isOpen={showEndPicker}
                  onToggle={() => {
                    setShowEndPicker(!showEndPicker)
                    setShowStartPicker(false)
                  }}
                />
              </View>
            </View>

            {/* Types & Demographics */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                }}
              >
                Type
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[
                  { label: 'Event', value: 'Event' },
                  { label: 'Repeating', value: 'Repeating_classes' },
                  { label: 'Janazah', value: 'Janazah' },
                  { label: 'Volunteering', value: 'Volunteerng' },
                ].map((opt) => {
                  const active = postType === opt.value
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setPostType(active ? null : opt.value)}
                      style={{
                        backgroundColor: active ? '#2F855A' : '#F8F9FA',
                        borderColor: active ? '#2F855A' : '#DEE2E6',
                        borderWidth: 1,
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? '#FFFFFF' : '#1D4732',
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                  marginTop: 4,
                }}
              >
                Audience
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[
                  { label: 'Men', value: 'Brothers' },
                  { label: 'Women', value: 'Sisters' },
                  { label: 'Mixed', value: 'Mixed' },
                ].map((opt) => {
                  const active = demographic === opt.value
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDemographic(active ? null : opt.value)}
                      style={{
                        backgroundColor: active ? '#2F855A' : '#F8F9FA',
                        borderColor: active ? '#2F855A' : '#DEE2E6',
                        borderWidth: 1,
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? '#FFFFFF' : '#1D4732',
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
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
