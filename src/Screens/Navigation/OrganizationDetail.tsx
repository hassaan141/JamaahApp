import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
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
import { fetchOrganizationById } from '@/Supabase/fetchOrganizations'
import type { OrgPost } from '@/types'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import { useOrgPrayerTimes } from '@/Hooks/useOrgPrayerTimes'
import CombinedPrayerCard from '@/components/HomeScreen/CombinedPrayerCard'
import { followEventEmitter } from '@/Utils/followEventEmitter'

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
  const [expanded, setExpanded] = useState(false)
  const organizationName = org.name || 'Organization'
  const description = org.description || ''
  const memberCount = org.member_count || 0
  const type = org.type ?? ''
  const hasLongDescription = description.length > 140

  const getOrgTypeIcon = (
    t?: string,
  ): React.ComponentProps<typeof Feather>['name'] => {
    switch (t?.toLowerCase()) {
      case 'masjid':
        return 'home'
      case 'msa':
        return 'users'
      case 'islamic-school':
        return 'book-open'
      case 'sisters-group':
        return 'heart'
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
      case 'msa':
        return { bg: '#F3E8FF', text: '#5B21B6' }
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

  const getOrgTypeLabel = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'masjid':
        return 'Masjid'
      case 'msa':
        return 'MSA'
      case 'islamic-school':
        return 'Islamic School'
      case 'sisters-group':
        return 'Sisters Group'
      case 'youth-group':
        return 'Youth Group'
      case 'book-club':
        return 'Book Club'
      case 'book-store':
        return 'Book Store'
      case 'run-club':
        return 'Run Club'
      default:
        return 'Organization'
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
            <>
              <Text
                style={styles.organizationDescription}
                numberOfLines={expanded ? undefined : 3}
              >
                {description}
              </Text>
              {hasLongDescription && (
                <TouchableOpacity
                  onPress={() => setExpanded(!expanded)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.readMoreText}>
                    {expanded ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}
          {type ? (
            <Text
              style={[styles.typeLabel, { color: getOrgTypeColor(type).text }]}
            >
              {getOrgTypeLabel(type)}
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

const TABS = [
  { label: 'Classes', value: 'CLASSES' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Volunteer', value: 'VOLUNTEER' },
]

const AnnouncementsSection = ({
  announcements,
  loading,
  error,
}: {
  announcements: OrgPost[]
  loading: boolean
  error: string | null
}) => {
  const [activeTab, setActiveTab] = useState('CLASSES')
  const [isExpanded, setIsExpanded] = useState(false)

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const type = item.post_type || ''
      if (activeTab === 'CLASSES') return type === 'Repeating_classes'
      if (activeTab === 'EVENTS') return type === 'Event'
      if (activeTab === 'VOLUNTEER') return type === 'Volunteerng'
      return true
    })
  }, [announcements, activeTab])

  useEffect(() => {
    setIsExpanded(false)
  }, [activeTab])

  const visibleAnnouncements = isExpanded
    ? filteredAnnouncements
    : filteredAnnouncements.slice(0, 2)
  const hiddenCount = Math.max(0, filteredAnnouncements.length - 2)
  const handleExpand = () => setIsExpanded(true)
  const handleCollapse = () => setIsExpanded(false)

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    )
  if (error) return <EmptyState message={error} icon="alert-circle" />
  if (!announcements.length)
    return <EmptyState message="No announcements yet" icon="inbox" />

  return (
    <View>
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
          <View style={styles.announcementsList}>
            {visibleAnnouncements.map((item) => (
              <AnnouncementCard key={item.id} announcement={item} />
            ))}
          </View>
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
    </View>
  )
}

type OrgDetailRoute = RouteProp<
  Record<'OrganizationDetail', { org?: OrgParam }>,
  'OrganizationDetail'
>
type GenericNav = NavigationProp<Record<string, object | undefined>>

export default function OrganizationDetail() {
  const route = useRoute<OrgDetailRoute>()
  const navigation = useNavigation<GenericNav>()
  const initialOrg = route.params?.org as OrgParam | undefined

  // FIX 1: Turn 'org' into state so we can update it with full details
  const [org, setOrg] = useState<OrgParam | undefined>(initialOrg)

  const rawId = org?.id ?? org?.org_id
  const orgId = rawId != null ? String(rawId) : undefined

  const [announcements, setAnnouncements] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Follow logic
  const [following, setFollowing] = useState<boolean>(
    typeof org?.is_following === 'boolean' ? org.is_following : false,
  )
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState<number | null>(null)

  // FIX 2: State for fetching the full details
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleGoBack = () => {
    navigation.goBack()
  }

  const {
    times,
    todayTimes,
    orgName: prayerOrgName,
    targetDate,
    nextDay,
    prevDay,
    loading: prayerLoading,
  } = useOrgPrayerTimes(orgId)

  // FIX 3: Detect "Lite" object (from Map) and fetch full details
  useEffect(() => {
    if (!orgId) return

    // Heuristic: If description, phone, and amenities are all missing, it's likely a partial object
    const isLiteObject = !org?.description && !org?.phone && !org?.amenities

    if (isLiteObject) {
      const loadFullDetails = async () => {
        setDetailsLoading(true)
        try {
          const fullData = await fetchOrganizationById(orgId)
          if (fullData) {
            // Merge existing data with new full data
            setOrg((prev) => ({ ...prev, ...fullData }))
          }
        } catch (err) {
          console.error('Error fetching full org details:', err)
        } finally {
          setDetailsLoading(false)
        }
      }
      loadFullDetails()
    }
  }, [orgId]) // Run once when we get the ID

  // Fetch follow status if not provided
  useEffect(() => {
    if (!orgId) return
    if (typeof org?.is_following === 'boolean') return

    let isMounted = true
    const fetchFollowStatus = async () => {
      try {
        const result = await OrgFollow.isFollowingOrganization(orgId)
        if (isMounted) {
          setFollowing(result.following) // Fix: Use .following property
        }
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

  // Listen for follow status changes from other components
  useEffect(() => {
    if (!orgId) return

    const unsubscribe = followEventEmitter.subscribe(orgId, (isFollowing) => {
      setFollowing(isFollowing)
    })

    return unsubscribe
  }, [orgId])

  // Fetch follower count
  useEffect(() => {
    if (!orgId) return
    let mounted = true
    const loadCount = async () => {
      try {
        const c = await fetchOrgFollowerCount(orgId)
        if (mounted) setFollowerCount(c)
      } catch (err) {
        console.error('Error fetching follower count', err)
      }
    }
    loadCount()
    return () => {
      mounted = false
    }
  }, [orgId])

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
      let success = false
      if (previousFollowState) {
        success = await OrgFollow.unfollowOrganization(orgId)
      } else {
        success = await OrgFollow.followOrganization(orgId)
      }

      if (success) {
        // Emit event to sync other components
        followEventEmitter.emit(orgId, !previousFollowState)
        const c = await fetchOrgFollowerCount(orgId)
        setFollowerCount(c)
      } else {
        // Revert on API failure
        setFollowing(previousFollowState)
        console.error('Follow/unfollow API call failed')
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      setFollowing(previousFollowState)
    } finally {
      setFollowLoading(false)
    }
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

      {/* Show tiny loader if we are fetching the missing details */}
      {detailsLoading && (
        <View style={{ padding: 10 }}>
          <ActivityIndicator size="small" color="#2D6A4F" />
        </View>
      )}

      {(org.type?.toLowerCase() === 'masjid' ||
        org.type?.toLowerCase() === 'msa') &&
        !prayerLoading &&
        todayTimes && (
          <View style={{ marginVertical: 10 }}>
            <CombinedPrayerCard
              prayerTimes={todayTimes}
              modalPrayerTimes={times}
              orgName={prayerOrgName || org.name}
              currentDate={targetDate}
              onNextDay={nextDay}
              onPrevDay={prevDay}
            />
          </View>
        )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        <AnnouncementsSection
          announcements={announcements}
          loading={loading}
          error={error}
        />
      </View>

      {org.type?.toLowerCase() === 'masjid' && <AmenitiesCard org={org} />}

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
  readMoreText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 6,
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
  announcementsList: { paddingHorizontal: 16, gap: 12 },
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
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
    marginHorizontal: 16,
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
    marginHorizontal: 16,
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
