import React from 'react'
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function AnnouncementModal({
  visible,
  onClose,
  announcementTitle,
  setAnnouncementTitle,
  announcementBody,
  setAnnouncementBody,
  posting,
  handlePostAnnouncement,
}: {
  visible: boolean
  onClose: () => void
  announcementTitle: string
  setAnnouncementTitle: (v: string) => void
  announcementBody: string
  setAnnouncementBody: (v: string) => void
  posting: boolean
  handlePostAnnouncement: () => Promise<void> | void
}) {
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
            padding: 20,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
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
              placeholderTextColor="#ADB5BD"
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

          <View style={{ marginBottom: 20 }}>
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
              placeholderTextColor="#ADB5BD"
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

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
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
