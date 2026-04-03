import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as OrgFollow from '@/Supabase/organizationFollow'
import type { Organization } from '@/types'
import { followEventEmitter } from '@/Utils/followEventEmitter'
import type { NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '@/Screens/Navigation/RootNavigator'
import { useAuth } from '@/Auth/AuthProvider'
import { useTheme } from '@/theme'

type Props = { community: Organization & { is_following?: boolean } }

export default function CommunityItem({ community }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { session } = useAuth()
  const { theme } = useTheme()
  const isGuest = !session
  const [following, setFollowing] = useState(!!community.is_following)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const followFn = OrgFollow.followOrganization
  const unfollowFn = OrgFollow.unfollowOrganization

  // Listen for follow status changes from other screens
  useEffect(() => {
    const orgId = String(community.id)
    const unsubscribe = followEventEmitter.subscribe(orgId, (isFollowing) => {
      setFollowing(isFollowing)
    })
    return unsubscribe
  }, [community.id])

  const handleFollowToggle = async () => {
    if (loading) return
    const previousState = following
    setLoading(true)

    // Optimistic update
    setFollowing(!following)

    try {
      let success = false
      if (following) {
        success = await unfollowFn(String(community.id))
      } else {
        success = await followFn(String(community.id))
      }

      if (success) {
        // Emit event to sync other components
        followEventEmitter.emit(String(community.id), !previousState)
      } else {
        // Revert on API failure
        setFollowing(previousState)
        console.error('Follow/unfollow API call failed')
      }
    } catch (_err) {
      // Revert optimistic update on error
      setFollowing(previousState)
      console.error('follow/unfollow error', _err)
    } finally {
      setLoading(false)
    }
  }

  const handlePress = () => {
    const orgWithCurrentState = {
      ...community,
      is_following: following,
    }
    navigation.navigate('OrganizationDetail', { org: orgWithCurrentState })
  }

  const name = community.name
  const type = community.type ?? 'Organization'
  const description =
    (community as unknown as { description?: string }).description ?? ''
  const hasLongDescription = (description || '').length > 140
  const displayDescription = description || ''

  const getOrgTypeIcon = (
    type: string,
  ): React.ComponentProps<typeof Feather>['name'] => {
    switch (type?.toLowerCase()) {
      case 'masjid':
        return 'map-pin'
      case 'msa':
        return 'users'
      case 'islamic-school':
        return 'bookmark'
      case 'sisters-group':
        return 'heart'
      case 'youth-group':
        return 'zap'
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

  const getOrgTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
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

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View
        style={[
          styles.accentBar,
          { backgroundColor: getOrgTypeColor(type).text },
        ]}
      />
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.cardTitle, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {name}
            </Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getOrgTypeColor(type).bg },
            ]}
          >
            <Feather
              name={getOrgTypeIcon(type)}
              size={12}
              color={getOrgTypeColor(type).text}
              style={styles.typeBadgeIcon}
            />
            <Text
              style={[
                styles.typeBadgeText,
                { color: getOrgTypeColor(type).text },
              ]}
            >
              {getOrgTypeLabel(type)}
            </Text>
          </View>
        </View>
        {/* Hide follow button for guests */}
        {!isGuest && (
          <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: theme.colors.primary },
              following && styles.followingButton,
              following && {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primaryBorder,
              },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleFollowToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={following ? theme.colors.primary : '#FFFFFF'}
              />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  following && styles.followingButtonText,
                  following && { color: theme.colors.primary },
                ]}
              >
                {following ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[styles.cardDescription, { color: theme.colors.textMuted }]}
        numberOfLines={expanded ? undefined : 2}
        ellipsizeMode="tail"
      >
        {displayDescription}
      </Text>
      {hasLongDescription && (
        <TouchableOpacity
          onPress={() => setExpanded((s) => !s)}
          activeOpacity={0.7}
        >
          <Text style={[styles.readMore, { color: theme.colors.primary }]}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleBlock: { flex: 1, minWidth: 0 },
  titleRow: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  followButton: {
    marginLeft: 12,
    minHeight: 34,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    borderWidth: 1,
  },
  followButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  followingButtonText: { color: '#2F855A' },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadgeIcon: { marginRight: 4 },
  typeBadgeText: { fontSize: 12, color: '#2F855A', fontWeight: '600' },
  readMore: {
    marginTop: 8,
    color: '#2F855A',
    fontWeight: '600',
    fontSize: 13,
  },
})
