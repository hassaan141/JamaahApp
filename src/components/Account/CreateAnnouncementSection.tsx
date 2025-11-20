import React, { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { Profile } from '@/types'
import AnnouncementModal from '@/components/Account/AnnouncementModal'
import { createOrgAnnouncement } from '@/Supabase/createOrgAnnouncement'
import { toast } from '@/components/Toast/toast'

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
  const [sendPush, setSendPush] = useState<boolean>(false)
  const [posting, setPosting] = useState(false)

  const handlePostAnnouncement = async () => {
    if (!announcementBody.trim() || !profile?.org_id || !profile?.id) {
      toast.error('Announcement details cannot be empty.', 'Add details')
      return
    }
    setPosting(true)
    try {
      const { ok, error, data } = await createOrgAnnouncement({
        organization_id: profile.org_id,
        author_profile_id: profile.id,
        title: announcementTitle.trim() || 'Announcement',
        body: announcementBody.trim(),
        send_push: sendPush,
        post_type: postType ?? null,
        demographic: demographic ?? null,
        start_time: startTime ?? null,
        end_time: endTime ?? null,
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
      setSendPush(false)
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
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        postType={postType}
        setPostType={setPostType}
        demographic={demographic}
        setDemographic={setDemographic}
        sendPush={sendPush}
        setSendPush={setSendPush}
        posting={posting}
        handlePostAnnouncement={handlePostAnnouncement}
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
