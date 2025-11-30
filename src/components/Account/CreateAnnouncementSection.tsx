import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { Profile, Database } from '@/types'
import AnnouncementModal from '@/components/Account/AnnouncementModal'
import { createOrgAnnouncement } from '@/Supabase/createOrgAnnouncement'
import { toast } from '@/components/Toast/toast'
import { supabase } from '@/Supabase/supabaseClient'
import { ENV } from '@/core/env'

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
              // update local address and coordinates in state if available
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
