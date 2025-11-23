import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import TitleInput from './CreateAnnouncements/TitleInput'
import TypeSelector from './CreateAnnouncements/TypeSelector'
import ScheduleSection from './CreateAnnouncements/ScheduleSection'
import TimeInputSection from './CreateAnnouncements/TimeInputSection'
import AudienceSelector from './CreateAnnouncements/AudienceSelector'
import DescriptionInput from './CreateAnnouncements/DescriptionInput'
import LocationSelector from './CreateAnnouncements/LocationSelector'
import type { Organization, OrgPost } from '@/types'

export default function EditAnnouncementModal({
  visible,
  onClose,
  announcement,
  organization,
  onUpdate,
  onDelete,
}: {
  visible: boolean
  onClose: () => void
  announcement: OrgPost | null
  organization?: Organization | null
  onUpdate: (updatedData: {
    title: string
    body: string
    post_type: string | null
    demographic: string | null
    recurs_on_days: number[] | null
    start_time: string | null
    end_time: string | null
    date: string | null
    location: string | null
    lat: number | null
    long: number | null
  }) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [postType, setPostType] = useState<string | null>(null)
  const [demographic, setDemographic] = useState<string | null>(null)
  const [recurringDays, setRecurringDays] = useState<number[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<{
    address: string
    lat?: number | null
    lng?: number | null
    isCurrentAddress?: boolean
  } | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Populate form when announcement changes
  useEffect(() => {
    if (announcement) {
      setAnnouncementTitle(announcement.title || '')
      setAnnouncementBody(announcement.body || '')
      setStartTime(announcement.start_time)
      setEndTime(announcement.end_time)
      setPostType(announcement.post_type)
      setDemographic(announcement.demographic)
      setRecurringDays(announcement.recurs_on_days || [])
      setDate(announcement.date)

      if (announcement.location) {
        // Check if this is the organization's address (current address) or a custom address
        const isOrgAddress = organization?.address === announcement.location
        console.log('[EditAnnouncementModal] Debug location data:', {
          announcementLocation: announcement.location,
          orgAddress: organization?.address,
          isOrgAddress,
          lat: announcement.lat,
          long: announcement.long,
        })
        setLocationData({
          address: announcement.location,
          lat: announcement.lat,
          lng: announcement.long,
          isCurrentAddress: isOrgAddress,
        })
      } else {
        setLocationData(null)
      }
    }
  }, [announcement])

  const handleLocationChange = React.useCallback(
    (loc: {
      address: string
      lat?: number | null
      lng?: number | null
      isCurrentAddress?: boolean
    }) => {
      setLocationData(loc)
    },
    [],
  )

  const handleUpdate = async () => {
    if (!announcementBody.trim()) return

    setUpdating(true)
    try {
      // Geocode if needed
      let lat: number | null = locationData?.lat ?? null
      let lng: number | null = locationData?.lng ?? null

      if ((lat == null || lng == null) && locationData?.address) {
        try {
          const apiKey =
            process.env.EXPO_PUBLIC_OPENROUTE_API || process.env.OPENROUTE_API
          if (apiKey) {
            const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
              locationData.address,
            )}`
            const resp = await fetch(url)
            if (resp.ok) {
              const json = await resp.json()
              if (
                json &&
                json.features &&
                json.features.length > 0 &&
                json.features[0].geometry &&
                json.features[0].geometry.coordinates
              ) {
                const [foundLng, foundLat] =
                  json.features[0].geometry.coordinates
                lat = foundLat
                lng = foundLng
              }
            }
          }
        } catch (e) {
          console.warn('[geocode] failed to resolve address', e)
        }
      }

      await onUpdate({
        title: announcementTitle.trim() || 'Announcement',
        body: announcementBody.trim(),
        post_type: postType,
        demographic: demographic,
        recurs_on_days: recurringDays.length > 0 ? recurringDays : null,
        start_time: startTime,
        end_time: endTime,
        date: date,
        location: locationData?.address || null,
        lat: lat,
        long: lng,
      })
      onClose()
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
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
              name="edit-3"
              size={24}
              color="#2F855A"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 20, fontWeight: '600', color: '#1D4732' }}
              >
                Edit Announcement
              </Text>
              <Text style={{ fontSize: 13, color: '#6C757D', marginTop: 2 }}>
                Update your announcement details
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
              initialLocationData={locationData}
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
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#DC2626',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                opacity: deleting ? 0.6 : 1,
              }}
              onPress={handleDelete}
              disabled={deleting || updating}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row' }}>
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
                  opacity: updating ? 0.6 : 1,
                }}
                onPress={handleUpdate}
                disabled={updating || deleting}
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}
                >
                  {updating ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
