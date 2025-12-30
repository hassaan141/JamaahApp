import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { Profile, OrgPost, Organization } from '@/types'
import { fetchMyOrgPosts } from '@/Supabase/fetchMyOrgPosts'
import { updateOrgAnnouncement } from '@/Supabase/updateOrgAnnouncement'
import { deleteOrgAnnouncement } from '@/Supabase/deleteOrgAnnouncement'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import EditAnnouncementModal from './EditAnnouncementModal'
import { toast } from '@/components/Toast/toast'
import MiniLoading from '@/components/Loading/MiniLoading'

const TABS = [
  { label: 'Classes', value: 'CLASSES' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Volunteer', value: 'VOLUNTEER' },
]

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
  const [activeTab, setActiveTab] = useState('CLASSES')
  const [isExpanded, setIsExpanded] = useState(false)

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
      const postsData = await fetchMyOrgPosts()
      setAnnouncements(postsData)
    } else {
      toast.error(error || 'Failed to delete announcement', 'Error')
    }
  }

  useEffect(() => {
    setIsExpanded(false)
  }, [activeTab])

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const type = item.post_type || ''
      if (activeTab === 'CLASSES') return type === 'Repeating_classes'
      if (activeTab === 'EVENTS') return type === 'Event'
      if (activeTab === 'VOLUNTEER') return type === 'Volunteerng'
      return true
    })
  }, [announcements, activeTab])

  const visibleAnnouncements = isExpanded
    ? filteredAnnouncements
    : filteredAnnouncements.slice(0, 2)
  const hiddenCount = Math.max(0, filteredAnnouncements.length - 2)

  const handleExpand = () => setIsExpanded(true)
  const handleCollapse = () => setIsExpanded(false)

  // Loading state wrapped in the card container for visual consistency
  if (loading) {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.loadingContainer}>
          <MiniLoading />
        </View>
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
          No announcements yet.
        </Text>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.value
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[styles.tab, isActive && styles.activeTab]}
                    onPress={() => setActiveTab(tab.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.tabText, isActive && styles.activeTabText]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>
                No {activeTab.toLowerCase()} found.
              </Text>
            </View>
          ) : (
            <>
              {visibleAnnouncements.map((item) => (
                <AnnouncementCard
                  key={item.id}
                  announcement={item}
                  showEditButton
                  onEdit={() => handleEdit(item)}
                />
              ))}

              {!isExpanded && hiddenCount > 0 && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={handleExpand}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandButtonText}>
                    +{hiddenCount} more {activeTab.toLowerCase()}
                  </Text>
                </TouchableOpacity>
              )}

              {isExpanded && (
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={handleCollapse}
                  activeOpacity={0.7}
                >
                  <Text style={styles.collapseButtonText}>Show less</Text>
                  <Feather name="chevron-up" size={16} color="#718096" />
                </TouchableOpacity>
              )}
            </>
          )}
        </>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#48BB78',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expandButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 12,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '500',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 12,
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4A5568',
    maxWidth: 260,
  },
})
