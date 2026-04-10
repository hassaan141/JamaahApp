import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native'
import type { Profile, Database } from '@/types'
import AnnouncementModal from '@/components/Account/AnnouncementModal'
import { createOrgAnnouncement } from '@/Supabase/createOrgAnnouncement'
import { toast } from '@/components/Toast/toast'
import { supabase } from '@/Supabase/supabaseClient'
import { ENV } from '@/core/env'
import { notifyFollowersOfPost } from '@/Supabase/sendPushNotification'
import { useTheme } from '@/theme'
import { announcementEventEmitter } from '@/Utils/announcementEventEmitter'

type Organization = Database['public']['Tables']['organizations']['Row']
type LocationData = {
  address: string
  lat?: number | null
  lng?: number | null
  isCurrentAddress?: boolean
}

function isPastAnnouncementDate(date: string | null) {
  if (!date) return false

  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return false

  const selectedDate = new Date(year, month - 1, day)
  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  return selectedDate.getTime() < todayStart.getTime()
}

function formatAnnouncementDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return date

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getAnnouncementValidationError(input: {
  announcementBody: string
  postType: string | null
  startTime: string | null
  endTime: string | null
  demographic: string | null
  recurringDays: number[]
  date: string | null
  locationAddress: string | null
  hasProfile: boolean
}) {
  if (!input.announcementBody.trim()) {
    return {
      title: 'Add details',
      message: 'Announcement details cannot be empty.',
    }
  }

  if (!input.postType) {
    return {
      title: 'Post type required',
      message: 'Select a post type before posting.',
    }
  }

  if (
    input.postType === 'Repeating_classes' &&
    input.recurringDays.length === 0
  ) {
    return {
      title: 'Schedule required',
      message: 'Select at least one recurring day for classes.',
    }
  }

  if (input.postType !== 'Repeating_classes' && !input.date) {
    return {
      title: 'Date required',
      message: 'Choose a date for this announcement before posting.',
    }
  }

  if (input.date && isPastAnnouncementDate(input.date)) {
    return {
      title: 'Invalid date',
      message: `${formatAnnouncementDate(input.date)} is in the past. Choose today or a future date.`,
    }
  }

  if (!input.startTime) {
    return {
      title: 'Start time required',
      message: 'Choose a start time before posting.',
    }
  }

  if (!input.endTime) {
    return {
      title: 'End time required',
      message: 'Choose an end time before posting.',
    }
  }

  if (!input.demographic) {
    return {
      title: 'Audience required',
      message: 'Select an audience before posting.',
    }
  }

  if (!input.locationAddress?.trim()) {
    return {
      title: 'Location required',
      message: 'Choose an event location before posting.',
    }
  }

  if (!input.hasProfile) {
    return {
      title: 'Unable to post',
      message: 'Your organization profile is missing required account details.',
    }
  }

  return null
}

export default function CreateAnnouncementSection({
  profile,
}: {
  profile: Partial<Profile> | null
}) {
  const { theme } = useTheme()
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [postType, setPostType] = useState<string | null>(null)
  const [demographic, setDemographic] = useState<string | null>(null)
  const [recurringDays, setRecurringDays] = useState<number[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const lastFetchedOrgId = useRef<string | null>(null)

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!profile?.org_id || profile.org_id === lastFetchedOrgId.current)
        return

      lastFetchedOrgId.current = profile.org_id

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single()

      if (data && !error) {
        setOrganization(data)
      }
    }

    fetchOrganization()
  }, [profile?.org_id])

  const handlePostAnnouncement = async () => {
    const validationError = getAnnouncementValidationError({
      announcementBody,
      postType,
      startTime,
      endTime,
      demographic,
      recurringDays,
      date,
      locationAddress: locationData?.address ?? null,
      hasProfile: Boolean(profile?.org_id) && Boolean(profile?.id),
    })
    if (validationError) {
      Alert.alert(validationError.title, validationError.message)
      return
    }
    if (!profile?.org_id || !profile?.id) return

    setPosting(true)
    try {
      let lat: number | null = locationData?.lat ?? null
      let lng: number | null = locationData?.lng ?? null

      if ((lat === null || lng === null) && locationData?.address) {
        try {
          const fnUrl = `${ENV.SUPABASE_URL.replace(/\/$/, '')}/functions/v1/openroute_api`
          const resp = await fetch(fnUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ address: locationData.address }),
          })

          if (resp.ok) {
            const json = (await resp.json()) as {
              ok?: boolean
              lat?: number | string
              lng?: number | string
              address?: string
            }
            if (json && json.ok && json.lat != null && json.lng != null) {
              const foundLat = Number(json.lat)
              const foundLng = Number(json.lng)
              lat = foundLat
              lng = foundLng
              setLocationData((prev) => ({
                address:
                  json.address ?? prev?.address ?? locationData?.address ?? '',
                lat: foundLat,
                lng: foundLng,
                isCurrentAddress: false,
              }))
            }
          } else {
            console.warn('Geocoding function responded not OK:', resp.status)
          }
        } catch (e) {
          console.warn('[geocode] failed to resolve address via function', e)
        }
      }

      const { ok, error, data } = await createOrgAnnouncement({
        organization_id: profile.org_id,
        author_profile_id: profile.id,
        title: announcementTitle.trim() || 'Announcement',
        body: announcementBody.trim(),
        post_type: postType ?? null,
        demographic: demographic ?? null,
        recurs_on_days: recurringDays.length > 0 ? recurringDays : null,
        start_time: startTime ?? null,
        end_time: endTime ?? null,
        date: date ?? null,
        location: locationData?.address ?? null,
        lat: lat ?? null,
        long: lng ?? null,
      })
      if (!ok || !data) {
        toast.error(error || 'Unknown error', 'Error posting announcement')
        return
      }

      if (data.id && profile.org_id) {
        console.log(
          `[CreateAnnouncement] Sending notifications for post ${data.id} to org ${profile.org_id}`,
        )
        notifyFollowersOfPost(
          data.id,
          profile.org_id,
          announcementTitle.trim() || 'Announcement',
          announcementBody.trim(),
        )
          .then((res) => {
            if (!res.success) {
              console.error('Failed to send push:', res.error)
              toast.error('Failed to send notifications', 'Push Error')
            } else {
              console.log('Push notification sent:', res.message)
              toast.success(
                `Notifications sent: ${res.message}`,
                'Push Success',
              )
            }
          })
          .catch((err) => {
            console.error('Push notification error:', err)
            toast.error('Push notification failed', 'Error')
          })
      }

      toast.success(
        'Your announcement has been shared.',
        'Announcement posted!',
      )
      announcementEventEmitter.emit({
        type: 'created',
        announcementId: data.id,
        organizationId: profile.org_id,
      })
      setAnnouncementTitle('')
      setAnnouncementBody('')
      setStartTime(null)
      setEndTime(null)
      setPostType(null)
      setDemographic(null)
      setRecurringDays([])
      setDate(null)
      setLocationData(null)
      setShowAnnouncementModal(false)
    } finally {
      setPosting(false)
    }
  }

  const styles = StyleSheet.create({
    primaryButton: {
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  })

  return (
    <>
      <AnnouncementModal
        visible={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        announcementTitle={announcementTitle}
        setAnnouncementTitle={setAnnouncementTitle}
        announcementBody={announcementBody}
        setAnnouncementBody={setAnnouncementBody}
        recurringDays={recurringDays}
        setRecurringDays={setRecurringDays}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        postType={postType}
        setPostType={setPostType}
        demographic={demographic}
        setDemographic={setDemographic}
        date={date}
        setDate={setDate}
        posting={posting}
        handlePostAnnouncement={handlePostAnnouncement}
        organization={organization}
        locationData={locationData}
        setLocationData={setLocationData}
      />

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={() => setShowAnnouncementModal(true)}
      >
        <Text style={styles.buttonText}>+ Create Announcement</Text>
      </TouchableOpacity>
    </>
  )
}
