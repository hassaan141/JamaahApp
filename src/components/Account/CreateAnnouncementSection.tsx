import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { Profile, Database } from '@/types'
import AnnouncementModal from '@/components/Account/AnnouncementModal'
import { createOrgAnnouncement } from '@/Supabase/createOrgAnnouncement'
import { toast } from '@/components/Toast/toast'
import { supabase } from '@/Supabase/supabaseClient'

type Organization = Database['public']['Tables']['organizations']['Row']
type LocationData = {
  address: string
  lat?: number | null
  lng?: number | null
  isCurrentAddress?: boolean
}

export default function CreateAnnouncementSection({
  profile,
}: {
  profile: Partial<Profile> | null
}) {
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
    if (!announcementBody.trim() || !profile?.org_id || !profile?.id) {
      toast.error('Announcement details cannot be empty.', 'Add details')
      return
    }
    setPosting(true)
    try {
      // Initialize lat/lng with whatever is in the state (null if custom address was typed)
      let lat: number | null = locationData?.lat ?? null
      let lng: number | null = locationData?.lng ?? null

      // If we have an address but NULL coordinates, trigger the Geocoding API
      if ((lat === null || lng === null) && locationData?.address) {
        try {
          // Note: In Expo, use Constants.expoConfig.extra or ensure .env is loaded
          const apiKey = process.env.EXPO_PUBLIC_OPENROUTE_API

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
                // Update the local variables to be used in the createOrgAnnouncement call below
                const [foundLng, foundLat] =
                  json.features[0].geometry.coordinates
                lat = foundLat
                lng = foundLng
              }
            } else {
              console.warn('Geocoding API responded but not OK:', resp.status)
            }
          } else {
            console.warn(
              'OPENROUTE_API key is missing in environment variables.',
            )
          }
        } catch (e) {
          console.warn('[geocode] failed to resolve address', e)
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
        // Use the local variables 'lat' and 'lng' which might have been updated by the API above
        lat: lat ?? null,
        long: lng ?? null,
      })
      if (!ok || !data) {
        toast.error(error || 'Unknown error', 'Error posting announcement')
        return
      }
      toast.success(
        'Your announcement has been shared.',
        'Announcement posted!',
      )
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
      backgroundColor: '#2F855A',
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
        style={styles.primaryButton}
        onPress={() => setShowAnnouncementModal(true)}
      >
        <Text style={styles.buttonText}>+ Create Announcement</Text>
      </TouchableOpacity>
    </>
  )
}
