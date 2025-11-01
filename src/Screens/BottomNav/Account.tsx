import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type Feather from '@expo/vector-icons/Feather'
import type { OrgPost } from '@/types'
import { useAuth, useAuthStatus } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import LoadingAnimation from '@/components/Loading/Loading'
import AccountHeader from '@/components/Account/AccountHeader'
import AnnouncementModal from '@/components/Account/AnnouncementModal'
import AnnouncementsSection from '@/components/Account/AnnouncementsSection'
import EventsSection from '@/components/Account/EventsSection'
import VersionFooter from '@/components/Account/VersionFooter'
import { fetchMyOrgPosts } from '@/Supabase/fetchMyOrgPosts'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import { fetchOrgPostCount } from '@/Supabase/fetchOrgPostCount'
import { fetchMyAnnouncements } from '@/Supabase/fetchMyAnnouncements'
import { createOrgAnnouncement } from '@/Supabase/createOrgAnnouncement'
import { toast } from '@/components/Toast/toast'

type MinimalNav = {
  getState?: () => { routeNames?: string[] }
  navigate?: (name: string) => void
}

export default function Account() {
  const navigation = useNavigation() as unknown as MinimalNav
  const { logout } = useAuth()
  const { isLoggedIn, isVerified } = useAuthStatus()
  const { profile, loading, error, refetch } = useProfile()
  const [refreshing, setRefreshing] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [orgAnnouncements, setOrgAnnouncements] = useState<OrgPost[]>([])
  type EventItem = {
    id: string
    title: string
    meta?: string | null
    icon?: React.ComponentProps<typeof Feather>['name']
    description?: string | null
    body?: string | null
  }
  const [userEvents, setUserEvents] = useState<EventItem[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [postCount, setPostCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)

  const isOrganization = useMemo(
    () => profile?.is_org === true && !!profile?.org_id,
    [profile?.is_org, profile?.org_id],
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.warn('[Account] logout error', e)
    }
  }

  const loadOrgCounts = useCallback(async () => {
    if (!isOrganization || !profile?.org_id) {
      return { posts: 0, followers: 0 }
    }

    try {
      const [posts, followers] = await Promise.all([
        fetchOrgPostCount(profile.org_id),
        fetchOrgFollowerCount(),
      ])
      return {
        posts: typeof posts === 'number' ? posts : 0,
        followers: typeof followers === 'number' ? followers : 0,
      }
    } catch (countError) {
      console.error('[Account] Failed to load organization counts', countError)
      return { posts: 0, followers: 0 }
    }
  }, [isOrganization, profile?.org_id])

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn || !profile?.id) {
      setRefreshing(false)
      setLoadingAnnouncements(false)
      return
    }
    setRefreshing(true)
    setLoadingAnnouncements(true)
    try {
      await refetch()
      if (isOrganization) {
        const [postsData, counts] = await Promise.all([
          fetchMyOrgPosts(),
          loadOrgCounts(),
        ])
        setOrgAnnouncements(postsData)
        setPostCount(counts.posts)
        setFollowerCount(counts.followers)
      } else {
        const data = await fetchMyAnnouncements()
        setUserEvents(data)
        setPostCount(0)
        setFollowerCount(0)
      }
    } finally {
      setLoadingAnnouncements(false)
      setRefreshing(false)
    }
  }, [refetch, isLoggedIn, profile?.id, isOrganization, loadOrgCounts])

  React.useEffect(() => {
    let isActive = true

    const loadData = async () => {
      if (!isLoggedIn || !profile?.id) {
        setLoadingAnnouncements(false)
        return
      }
      setLoadingAnnouncements(true)
      try {
        if (isOrganization) {
          const [postsData, counts] = await Promise.all([
            fetchMyOrgPosts(),
            loadOrgCounts(),
          ])
          if (!isActive) return
          setOrgAnnouncements(postsData)
          setPostCount(counts.posts)
          setFollowerCount(counts.followers)
        } else {
          const data = await fetchMyAnnouncements()
          if (!isActive) return
          setUserEvents(data)
          setPostCount(0)
          setFollowerCount(0)
        }
      } catch (loadError) {
        if (isActive) {
          console.error('[Account] Failed to load announcements', loadError)
          setPostCount(0)
          setFollowerCount(0)
        }
      } finally {
        if (isActive) {
          setLoadingAnnouncements(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [isLoggedIn, profile?.id, isOrganization, loadOrgCounts])

  const handleOpenSettings = useCallback(() => {
    const state = navigation.getState?.()
    const availableRoutes = state?.routeNames || []
    const targetRoute = availableRoutes.includes('AccountSettings')
      ? 'AccountSettings'
      : availableRoutes.includes('Settings')
        ? 'Settings'
        : null
    if (targetRoute && navigation.navigate) {
      navigation.navigate(targetRoute)
      return
    }
    toast.success(
      "Connect this icon to your settings screen when it's ready.",
      'Settings',
    )
  }, [navigation])

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
        send_push: false,
      })
      if (!ok || !data) {
        toast.error(error || 'Unknown error', 'Error posting announcement')
        return
      }
      toast.success(
        'Your announcement has been shared.',
        'Announcement posted!',
      )
      const counts = await loadOrgCounts()
      setPostCount(counts.posts)
      setFollowerCount(counts.followers)
      setAnnouncementTitle('')
      setAnnouncementBody('')
      // Refresh announcements list
      const postsData = await fetchMyOrgPosts()
      setOrgAnnouncements(postsData)
    } finally {
      setPosting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Please sign in to view your account</Text>
      </View>
    )
  }

  if (loading) {
    return <LoadingAnimation />
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <Text>Error loading profile: {error.message}</Text>
      </View>
    )
  }

  const displayAnnouncements = isOrganization ? orgAnnouncements : []
  const displayEvents = !isOrganization ? userEvents : []

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2F855A"
          />
        }
      >
        <AccountHeader
          profile={profile}
          postCount={postCount}
          followerCount={followerCount}
          isOrganization={!!isOrganization}
          handleOpenSettings={handleOpenSettings}
        />

        {!isVerified && (
          <View style={styles.verifyBanner}>
            <Text style={styles.verifyText}>📧 Please verify your email</Text>
          </View>
        )}

        {isOrganization ? (
          <>
            <AnnouncementModal
              visible={showAnnouncementModal}
              onClose={() => setShowAnnouncementModal(false)}
              announcementTitle={announcementTitle}
              setAnnouncementTitle={setAnnouncementTitle}
              announcementBody={announcementBody}
              setAnnouncementBody={setAnnouncementBody}
              posting={posting}
              handlePostAnnouncement={async () => {
                await handlePostAnnouncement()
                setShowAnnouncementModal(false)
              }}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowAnnouncementModal(true)}
            >
              <Text style={styles.buttonText}>+ Create Announcement</Text>
            </TouchableOpacity>

            {loadingAnnouncements ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F855A" />
                <Text style={styles.loadingText}>Loading announcements...</Text>
              </View>
            ) : (
              <AnnouncementsSection
                loadingAnnouncements={loadingAnnouncements}
                displayAnnouncements={displayAnnouncements}
                styles={styles}
              />
            )}
          </>
        ) : loadingAnnouncements ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F855A" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <EventsSection
            loadingAnnouncements={loadingAnnouncements}
            displayEvents={displayEvents}
            styles={styles}
          />
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <VersionFooter styles={styles} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  verifyBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  verifyText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6C757D',
    marginTop: 12,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
  announcementCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2F855A',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementHeading: {
    flex: 1,
    paddingRight: 10,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 4,
  },
  announcementPublished: {
    fontSize: 12,
    color: '#6C757D',
  },
  announcementBody: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  smallIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2F855A',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4732',
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 13,
    color: '#6C757D',
  },
  eventDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#6C757D',
  },
})
