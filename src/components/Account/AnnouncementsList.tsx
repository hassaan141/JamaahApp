import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { Profile, OrgPost, Organization } from '@/types'
import { fetchMyOrgPosts } from '@/Supabase/fetchMyOrgPosts'
import { updateOrgAnnouncement } from '@/Supabase/updateOrgAnnouncement'
import { deleteOrgAnnouncement } from '@/Supabase/deleteOrgAnnouncement'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import EditAnnouncementModal from './EditAnnouncementModal'
import { toast } from '@/components/Toast/toast'

export default function AnnouncementsList({
  profile,
  refreshKey,
  organization,
}: {
  profile: Partial<Profile> | null
  refreshKey?: boolean
  organization?: Organization | null
}) {
  const [announcements, setAnnouncements] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<OrgPost | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!profile?.org_id) return
      setLoading(true)
      try {
        const postsData = await fetchMyOrgPosts()
        setAnnouncements(postsData)
      } catch (error) {
        console.error('[AnnouncementsList] Failed to load announcements', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnnouncements()
  }, [profile?.org_id, refreshKey])

  const handleEdit = (announcement: OrgPost) => {
    setEditingAnnouncement(announcement)
    setShowEditModal(true)
  }

  const handleUpdate = async (updatedData: {
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
  }) => {
    if (!editingAnnouncement) return

    const { ok, error } = await updateOrgAnnouncement(
      editingAnnouncement.id,
      updatedData,
    )
    if (ok) {
      toast.success('Announcement updated successfully!', 'Success')
      // Refresh the list
      const postsData = await fetchMyOrgPosts()
      setAnnouncements(postsData)
    } else {
      toast.error(error || 'Failed to update announcement', 'Error')
    }
  }

  const handleDelete = async () => {
    if (!editingAnnouncement) return

    const { ok, error } = await deleteOrgAnnouncement(editingAnnouncement.id)
    if (ok) {
      toast.success('Announcement deleted successfully!', 'Success')
      // Refresh the list
      const postsData = await fetchMyOrgPosts()
      setAnnouncements(postsData)
    } else {
      toast.error(error || 'Failed to delete announcement', 'Error')
    }
  }

  const styles = StyleSheet.create({
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      marginRight: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1D4732',
    },
    sectionSubtitle: {
      fontSize: 13,
      color: '#6C757D',
      marginTop: 2,
    },

    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    loadingText: {
      color: '#6C757D',
      marginTop: 12,
      fontSize: 14,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F855A" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    )
  }

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Feather
          name="volume-2"
          size={20}
          color="#2F855A"
          style={styles.sectionIcon}
        />
        <View>
          <Text style={styles.sectionTitle}>Your Announcements</Text>
          <Text style={styles.sectionSubtitle}>
            Review what your community sees
          </Text>
        </View>
      </View>

      {announcements.length === 0 ? (
        <Text
          style={{ color: '#6C757D', textAlign: 'center', paddingVertical: 20 }}
        >
          No announcements yet
        </Text>
      ) : (
        announcements.map((item) => (
          <AnnouncementCard
            key={item.id}
            announcement={item}
            showEditButton
            showPublishedDate
            onEdit={() => handleEdit(item)}
          />
        ))
      )}

      <EditAnnouncementModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAnnouncement(null)
        }}
        announcement={editingAnnouncement}
        organization={organization}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </View>
  )
}
