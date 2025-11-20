import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

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
  postType,
  setPostType,
  demographic,
  setDemographic,
  sendPush,
  setSendPush,
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
  postType: string | null
  setPostType: (v: string | null) => void
  demographic: string | null
  setDemographic: (v: string | null) => void
  sendPush: boolean
  setSendPush: (v: boolean) => void
  posting: boolean
  handlePostAnnouncement: () => Promise<void> | void
}) {
  // Local state for showing pickers
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Helper to parse and format date/time
  const formatDateTime = (dt: string | null) => {
    if (!dt) return ''
    const d = new Date(dt)
    if (isNaN(d.getTime())) return dt
    return d.toLocaleString()
  }

  // Convert string to Date or undefined
  const parseDate = (dt: string | null) => {
    if (!dt) return undefined
    const d = new Date(dt)
    return isNaN(d.getTime()) ? undefined : d
  }

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
            maxHeight: 520,
            overflow: 'hidden',
          }}
        >
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

            <View style={{ marginBottom: 12 }}>
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

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                }}
              >
                Schedule (optional)
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: startTime ? '#2F855A' : '#FFFFFF',
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#2F855A',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    flex: 1,
                    marginRight: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#2F855A',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: startTime ? 2 : 0,
                  }}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: startTime ? '#FFFFFF' : '#2F855A',
                      fontWeight: '600',
                    }}
                  >
                    {startTime
                      ? formatDateTime(startTime)
                      : 'Start (pick date/time)'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: endTime ? '#2F855A' : '#FFFFFF',
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#2F855A',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#2F855A',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: endTime ? 2 : 0,
                  }}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: endTime ? '#FFFFFF' : '#2F855A',
                      fontWeight: '600',
                    }}
                  >
                    {endTime ? formatDateTime(endTime) : 'End (pick date/time)'}
                  </Text>
                </TouchableOpacity>
              </View>
              {showStartPicker && (
                <DateTimePicker
                  value={parseDate(startTime) ?? new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(false)
                    if (event.type === 'set' && date) {
                      setStartTime(date.toISOString())
                    }
                  }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={parseDate(endTime) ?? new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(false)
                    if (event.type === 'set' && date) {
                      setEndTime(date.toISOString())
                    }
                  }}
                />
              )}
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1D4732',
                  marginBottom: 8,
                }}
              >
                Type (optional)
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
                Audience (optional)
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

          <View
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 14, color: '#1D4732', fontWeight: '600' }}>
              Send push notification
            </Text>
            <Switch value={sendPush} onValueChange={setSendPush} />
          </View>

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
