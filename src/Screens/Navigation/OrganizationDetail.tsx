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
import { fetchOrgAnnouncements } from '@/Supabase/fetchOrgAnnouncements'
import type { OrgPost } from '@/types'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'

type OrgParam = {
  id?: string | number
  org_id?: string | number
  name?: string
  type?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  website?: string | null
  is_following?: boolean
  member_count?: number
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  donate_link?: string | null
  amenities?: {
    street_parking?: boolean
    women_washroom?: boolean
    on_site_parking?: boolean
    women_prayer_space?: boolean
    wheelchair_accessible?: boolean
  } | null
}

const OrganizationHeader = ({
  org,
  following,
  followLoading,
  onFollowToggle,
  followerCount,
}: {
  org: OrgParam
  following: boolean
  followLoading: boolean
  onFollowToggle: () => void
  followerCount?: number | null
}) => {
  const organizationName = org.name || 'Organization'
  const description = org.description || ''
  const memberCount = org.member_count || 0
  const type = org.type ?? ''

  const getOrgTypeIcon = (
    t?: string,
  ): React.ComponentProps<typeof Feather>['name'] => {
    switch (t?.toLowerCase()) {
      case 'masjid':
        return 'home'
      case 'islamic-school':
        return 'book-open'
      case 'sisters-group':
        return 'users'
      case 'youth-group':
        return 'user-plus'
      case 'book-club':
        return 'book'
      case 'book-store':
        return 'shopping-bag'
      case 'run-club':
        return 'activity'
      default:
        return 'map-pin'
    }
  }

  const getOrgTypeColor = (t?: string) => {
    switch (t?.toLowerCase()) {
      case 'masjid':
        return { bg: '#BBF7D0', text: '#166534' }
      case 'islamic-school':
        return { bg: '#FEF08A', text: '#CA8A04' }
      case 'sisters-group':
        return { bg: '#FBCFE8', text: '#BE185D' }
      case 'youth-group':
        return { bg: '#BFDBFE', text: '#1D4ED8' }
      case 'book-club':
        return { bg: '#DDD6FE', text: '#7C3AED' }
      case 'book-store':
        return { bg: '#FDE68A', text: '#D97706' }
      case 'run-club':
        return { bg: '#A7F3D0', text: '#059669' }
      default:
        return { bg: '#E2E8F0', text: '#64748B' }
    }
  }

  return (
    <View style={styles.headerCard}>
      <View style={styles.headerContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getOrgTypeColor(type).bg },
          ]}
        >
          <Feather
            name={getOrgTypeIcon(type)}
            size={32}
            color={getOrgTypeColor(type).text}
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.organizationName} numberOfLines={2}>
            {organizationName}
          </Text>
          {description ? (
            <Text style={styles.organizationDescription} numberOfLines={3}>
              {description}
            </Text>
          ) : null}
          {type ? (
            <Text
              style={[styles.typeLabel, { color: getOrgTypeColor(type).text }]}
            >
              {type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.memberInfo}>
          <Feather name="users" size={16} color="#52796F" />
          <Text style={styles.memberCount}>
            {typeof followerCount === 'number'
              ? `${followerCount.toLocaleString()} followers`
              : `${String(org.member_count ?? memberCount)} followers`}
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

const ContactInfoCard = ({ org }: { org: OrgParam }) => {
  const items: {
    key: string
    label: string
    value: string
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    onPress?: () => void
  }[] = []

  const addLink = (
    key: string,
    label: string,
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'],
    value?: string | null,
    onPress?: () => void,
  ) => {
    if (!value) return
    items.push({ key, label, value: value as string, icon, onPress })
  }

  const openUrl = (raw?: string | null) => {
    if (!raw) return
    const val = raw.trim()
    const url = val.startsWith('http') ? val : `https://${val}`
    Linking.openURL(url).catch((e) => console.error('open url', e))
  }

  const openSocial = (
    platform: 'twitter' | 'instagram' | 'facebook',
    raw?: string | null,
  ) => {
    if (!raw) return
    const handle = raw.trim().replace(/^@/, '')
    let url = ''
    if (platform === 'twitter') url = `https://twitter.com/${handle}`
    if (platform === 'instagram') url = `https://instagram.com/${handle}`
    if (platform === 'facebook')
      url = raw.startsWith('http') ? raw : `https://facebook.com/${handle}`
    Linking.openURL(url).catch((e) => console.error('open social', e))
  }

  addLink('website', 'Website', 'web', org.website || undefined, () =>
    openUrl(org.website),
  )
  addLink('twitter', 'Twitter', 'twitter', org.twitter || undefined, () =>
    openSocial('twitter', org.twitter),
  )
  addLink(
    'instagram',
    'Instagram',
    'instagram',
    org.instagram || undefined,
    () => openSocial('instagram', org.instagram),
  )
  addLink('facebook', 'Facebook', 'facebook', org.facebook || undefined, () =>
    openSocial('facebook', org.facebook),
  )
  addLink('email', 'Email', 'email', org.contact_email || undefined, () =>
    Linking.openURL(`mailto:${org.contact_email}`),
  )

  if (!items.length) return null

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Contact & Links</Text>
      <View style={styles.linksRow}>
        {items.map((it) => (
          <TouchableOpacity
            key={it.key}
            style={styles.linkPill}
            onPress={it.onPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={it.icon} size={14} color="#2D6A4F" />
            <Text style={styles.linkPillLabel}>{it.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// Using shared AnnouncementCard component imported above

const AmenitiesCard = ({ org }: { org: OrgParam }) => {
  const amenities = org.amenities || {}
  const items: {
    key: string
    label: string
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  }[] = [
    { key: 'street_parking', label: 'Street parking', icon: 'parking' },
    { key: 'on_site_parking', label: 'Site parking', icon: 'car' },
    {
      key: 'women_prayer_space',
      label: "Women's prayer",
      icon: 'gender-female',
    },
    { key: 'women_washroom', label: "Women's wash", icon: 'toilet' },
    {
      key: 'wheelchair_accessible',
      label: 'Wheelchair',
      icon: 'wheelchair-accessibility',
    },
  ]

  return (
    <View style={styles.amenitiesCard}>
      <Text style={styles.cardTitle}>Amenities</Text>
      <View style={styles.amenitiesRow}>
        {items.map((it) => {
          const present = Boolean(
            (amenities as Record<string, boolean | undefined>)[it.key],
          )
          return (
            <View
              key={it.key}
              style={[styles.amenityPill, present && styles.amenityPillActive]}
            >
              <MaterialCommunityIcons
                name={it.icon}
                size={14}
                color={present ? '#FFFFFF' : '#475569'}
              />
              <Text
                style={[
                  styles.amenityPillLabel,
                  present ? styles.amenityPillLabelActive : undefined,
                ]}
              >
                {it.label}
              </Text>
              <MaterialCommunityIcons
                name={present ? 'check-circle' : 'close-circle'}
                size={14}
                color={present ? (present ? '#FFFFFF' : '#10B981') : '#94A3B8'}
                style={styles.amenityStatusIcon}
              />
            </View>
          )
        })}
      </View>
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

  const [announcements, setAnnouncements] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [following, setFollowing] = useState<boolean>(
    typeof org?.is_following === 'boolean' ? org.is_following : false,
  )
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState<number | null>(null)

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

  // Fetch follower count (uses helper that returns current org's follower count)
  useEffect(() => {
    let mounted = true
    const loadCount = async () => {
      try {
        const c = await fetchOrgFollowerCount()
        if (mounted) setFollowerCount(c)
      } catch (err) {
        console.error('Error fetching follower count', err)
      }
    }
    loadCount()
    return () => {
      mounted = false
    }
  }, [])

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

  const renderAnnouncementItem = ({ item }: { item: OrgPost }) => (
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
        followerCount={followerCount}
      />

      <AmenitiesCard org={org} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        {renderAnnouncementsSection()}
      </View>

      <ContactInfoCard org={org} />
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
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  typeLabel: { marginTop: 6, fontSize: 12, fontWeight: '700' },
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
  infoActionButton: {
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  amenitiesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  amenitiesList: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' },
  amenitiesRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  amenityPillActive: { backgroundColor: '#2D6A4F' },
  amenityPillLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  amenityPillLabelActive: { color: '#FFFFFF' },
  amenityStatusIcon: { marginLeft: 8 },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    marginBottom: 8,
  },
  linkPillLabel: { marginLeft: 8, fontSize: 13, color: '#1B4332' },
})
