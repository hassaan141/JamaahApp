import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp, NavigationProp } from '@react-navigation/native'
import * as OrgFollow from '@/Supabase/organizationFollow'
import {
  fetchOrgAnnouncements,
  type OrgAnnouncement,
} from '@/Supabase/fetchOrgAnnouncements'

type OrgParam = {
  id?: string | number
  org_id?: string | number
  name?: string
  type?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  contact_phone?: string | null
  website?: string | null
  is_following?: boolean
  member_count?: number
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((Number(now) - Number(date)) / 1000)
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

const OrganizationHeader = ({
  org,
  following,
  followLoading,
  onFollowToggle,
}: {
  org: OrgParam
  following: boolean
  followLoading: boolean
  onFollowToggle: () => void
}) => {
  const organizationName = org.name || 'Organization'
  const description =
    org.description || 'A vibrant Islamic center serving the community.'
  const memberCount = org.member_count || 0

  return (
    <View style={styles.headerCard}>
      <View style={styles.headerContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="mosque" size={40} color="#2D6A4F" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.organizationName} numberOfLines={2}>
            {organizationName}
          </Text>
          <Text style={styles.organizationDescription} numberOfLines={3}>
            {description}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.memberInfo}>
          <Feather name="users" size={16} color="#52796F" />
          <Text style={styles.memberCount}>
            {memberCount.toLocaleString()} members
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.followButton,
            following && styles.followingButton,
            followLoading && styles.followButtonDisabled,
          ]}
          onPress={onFollowToggle}
          disabled={followLoading}
          activeOpacity={0.7}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color="#2D6A4F" />
          ) : (
            <Text
              style={[
                styles.followButtonText,
                following && styles.followingButtonText,
              ]}
            >
              {following ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const InfoRow = ({
  icon,
  label,
  value,
  isLink,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  value: string
  isLink?: boolean
  onPress?: () => void
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconContainer}>
      <Feather name={icon} size={18} color="#2D6A4F" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, isLink && styles.infoLink]}
        onPress={isLink ? onPress : undefined}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  </View>
)

const ContactInfoCard = ({ org }: { org: OrgParam }) => {
  const address = org.address || 'Address not available'
  const phone = org.phone || org.contact_phone || 'Phone not available'
  const website = org.website || null

  const handleWebsitePress = () => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`
      Linking.openURL(url)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Contact Information</Text>
      <InfoRow icon="map-pin" label="Address" value={address} />
      <InfoRow icon="phone" label="Phone" value={phone} />
      <InfoRow
        icon="globe"
        label="Website"
        value={website || 'Not available'}
        isLink={!!website}
        onPress={handleWebsitePress}
      />
    </View>
  )
}

const AnnouncementCard = ({
  announcement,
}: {
  announcement: OrgAnnouncement
}) => {
  const type = announcement.type || 'General'
  const title = announcement.title || 'Untitled'
  const body = announcement.body || ''
  const timeAgo = announcement.created_at
    ? formatTimeAgo(announcement.created_at)
    : 'Recently'
  return (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <View style={styles.announcementTypeContainer}>
          <Feather name="bell" size={16} color="#2D6A4F" />
          <Text style={styles.announcementType}>{type}</Text>
        </View>
        <Text style={styles.announcementTime}>{timeAgo}</Text>
      </View>
      <Text style={styles.announcementTitle} numberOfLines={2}>
        {title}
      </Text>
      {body ? (
        <Text style={styles.announcementBody} numberOfLines={4}>
          {body}
        </Text>
      ) : null}
    </View>
  )
}

const EmptyState = ({
  message,
  icon = 'info',
}: {
  message: string
  icon?: React.ComponentProps<typeof Feather>['name']
}) => (
  <View style={styles.emptyState}>
    <Feather name={icon} size={48} color="#E8F5E9" />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
)

type OrgDetailRoute = RouteProp<
  Record<'OrganizationDetail', { org?: OrgParam }>,
  'OrganizationDetail'
>
type GenericNav = NavigationProp<Record<string, object | undefined>>

export default function OrganizationDetail() {
  const route = useRoute<OrgDetailRoute>()
  const navigation = useNavigation<GenericNav>()
  const org = route.params?.org as OrgParam | undefined
  const rawId = org?.id ?? org?.org_id
  const orgId = rawId != null ? String(rawId) : undefined

  const [announcements, setAnnouncements] = useState<OrgAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [following, setFollowing] = useState<boolean>(
    typeof org?.is_following === 'boolean' ? org.is_following : false,
  )
  const [followLoading, setFollowLoading] = useState(false)

  const handleGoBack = () => {
    navigation.goBack()
  }

  // Fetch follow status if not provided
  useEffect(() => {
    if (!orgId) return
    if (typeof org?.is_following === 'boolean') return

    let isMounted = true
    const fetchFollowStatus = async () => {
      try {
        const status = await OrgFollow.isFollowingOrganization(orgId)
        if (isMounted) setFollowing(!!status)
      } catch (err) {
        console.error('Error fetching follow status:', err)
        if (isMounted) setFollowing(false)
      }
    }

    fetchFollowStatus()
    return () => {
      isMounted = false
    }
  }, [orgId, org?.is_following])

  // Fetch announcements
  useEffect(() => {
    if (!orgId) return
    let isMounted = true
    const loadAnnouncements = async () => {
      setLoading(true)
      setError(null)
      try {
        const posts = await fetchOrgAnnouncements(orgId)
        if (isMounted) setAnnouncements(posts || [])
      } catch (err) {
        console.error('Error loading announcements:', err)
        if (isMounted)
          setError('Unable to load announcements. Please try again later.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadAnnouncements()
    return () => {
      isMounted = false
    }
  }, [orgId])

  // Handle follow/unfollow with optimistic updates
  const handleFollowToggle = async () => {
    if (!orgId || followLoading) return
    const previousFollowState = following
    setFollowLoading(true)
    setFollowing(!following)
    try {
      if (previousFollowState) {
        await OrgFollow.unfollowOrganization(orgId)
      } else {
        await OrgFollow.followOrganization(orgId)
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      setFollowing(previousFollowState)
    } finally {
      setFollowLoading(false)
    }
  }

  const renderAnnouncementItem = ({ item }: { item: OrgAnnouncement }) => (
    <AnnouncementCard announcement={item} />
  )

  const renderAnnouncementsSection = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      )
    }
    if (error) return <EmptyState message={error} icon="alert-circle" />
    if (!announcements.length)
      return <EmptyState message="No announcements yet" icon="inbox" />
    return (
      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAnnouncementItem}
        scrollEnabled={false}
        contentContainerStyle={styles.announcementsList}
      />
    )
  }

  if (!org) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No organization provided</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#228f2bff" />
          </TouchableOpacity>
        </View>
      </View>

      <OrganizationHeader
        org={org}
        following={following}
        followLoading={followLoading}
        onFollowToggle={handleFollowToggle}
      />

      <ContactInfoCard org={org} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        {renderAnnouncementsSection()}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contentContainer: { paddingTop: 8, paddingBottom: 32 },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 5,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 4, marginRight: 12 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  headerContent: { flexDirection: 'row', marginBottom: 16 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: { flex: 1 },
  organizationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 4,
    lineHeight: 28,
  },
  organizationDescription: { fontSize: 14, color: '#52796F', lineHeight: 20 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberCount: {
    fontSize: 14,
    color: '#52796F',
    fontWeight: '600',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2D6A4F',
  },
  followButtonDisabled: { opacity: 0.6 },
  followButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  followingButtonText: { color: '#2D6A4F' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52796F',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 15, color: '#1B4332', lineHeight: 20 },
  infoLink: { color: '#2D6A4F', textDecorationLine: 'underline' },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4332',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  announcementsList: { paddingHorizontal: 16 },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  announcementTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D6A4F',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  announcementTime: { fontSize: 12, color: '#52796F' },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4332',
    marginBottom: 4,
    lineHeight: 22,
  },
  announcementBody: { fontSize: 14, color: '#52796F', lineHeight: 20 },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: '#52796F' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
    color: '#52796F',
    textAlign: 'center',
  },
})
