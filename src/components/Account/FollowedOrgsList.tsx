import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import Feather from '@expo/vector-icons/Feather'
import type {
  FollowedOrganization} from '@/Supabase/fetchMyFollowedOrgs';
import {
  fetchMyFollowedOrgs
} from '@/Supabase/fetchMyFollowedOrgs'
import { unfollowOrganization } from '@/Supabase/organizationFollow'
import { followEventEmitter } from '@/Utils/followEventEmitter'
import MiniLoading from '@/components/Loading/MiniLoading'
import { toast } from '@/components/Toast/toast'

interface FollowedOrgsListProps {
  refreshKey?: boolean
}

export default function FollowedOrgsList({
  refreshKey,
}: FollowedOrgsListProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [orgs, setOrgs] = useState<FollowedOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null)

  const loadOrgs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchMyFollowedOrgs()
      setOrgs(data)
    } catch (error) {
      console.error('[FollowedOrgsList] Failed to load orgs', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrgs()
  }, [loadOrgs, refreshKey])

  // Listen for follow/unfollow events from other components (e.g., OrganizationDetail)
  useEffect(() => {
    // Subscribe to all orgs we're currently showing
    const unsubscribes: (() => void)[] = []

    orgs.forEach((org) => {
      const unsubscribe = followEventEmitter.subscribe(
        org.id,
        (isFollowing) => {
          if (!isFollowing) {
            // Remove from local state when unfollowed elsewhere
            setOrgs((prev) => prev.filter((o) => o.id !== org.id))
          }
        },
      )
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [orgs])

  const handleUnfollow = async (orgId: string) => {
    setUnfollowingId(orgId)
    try {
      const success = await unfollowOrganization(orgId)
      if (success) {
        // Remove from local state
        setOrgs((prev) => prev.filter((o) => o.id !== orgId))
        // Emit event to sync other components
        followEventEmitter.emit(orgId, false)
        toast.success('Unfollowed successfully', 'Success')
      } else {
        toast.error('Failed to unfollow', 'Error')
      }
    } catch (error) {
      console.error('[FollowedOrgsList] Unfollow error', error)
      toast.error('Failed to unfollow', 'Error')
    } finally {
      setUnfollowingId(null)
    }
  }

  const handleOrgPress = (org: FollowedOrganization) => {
    navigation.navigate('OrganizationDetail', { org })
  }

  const visibleOrgs = isExpanded ? orgs : orgs.slice(0, 2)
  const hiddenCount = Math.max(0, orgs.length - 2)

  const getOrgTypeIcon = (
    type: string,
  ): React.ComponentProps<typeof Feather>['name'] => {
    switch (type?.toLowerCase()) {
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
          name="users"
          size={20}
          color="#2F855A"
          style={styles.sectionIcon}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.sectionTitle}>Following</Text>
          <Text style={styles.sectionSubtitle}>
            {orgs.length} organization{orgs.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {orgs.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyText}>
            You're not following any organizations yet. Explore the Communities
            tab to discover masjids and Islamic organizations near you.
          </Text>
        </View>
      ) : (
        <>
          {visibleOrgs.map((org) => (
            <TouchableOpacity
              key={org.id}
              style={styles.orgItem}
              onPress={() => handleOrgPress(org)}
              activeOpacity={0.7}
            >
              <View style={styles.orgIconContainer}>
                <Feather
                  name={getOrgTypeIcon(org.type)}
                  size={20}
                  color="#2F855A"
                />
              </View>
              <View style={styles.orgInfo}>
                <Text style={styles.orgName} numberOfLines={1}>
                  {org.name}
                </Text>
                <Text style={styles.orgType}>{getOrgTypeLabel(org.type)}</Text>
              </View>
              <TouchableOpacity
                style={styles.followingButton}
                onPress={() => handleUnfollow(org.id)}
                disabled={unfollowingId === org.id}
                activeOpacity={0.7}
              >
                {unfollowingId === org.id ? (
                  <ActivityIndicator size="small" color="#48BB78" />
                ) : (
                  <Text style={styles.followingButtonText}>Following</Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {!isExpanded && hiddenCount > 0 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.expandButtonText}>
                +{hiddenCount} more organization{hiddenCount !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}

          {isExpanded && orgs.length > 2 && (
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setIsExpanded(false)}
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
  headerTextContainer: {
    flex: 1,
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
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#718096',
    marginTop: 12,
    lineHeight: 20,
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  orgIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4732',
  },
  orgType: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  followingButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#48BB78',
    minWidth: 80,
    alignItems: 'center',
  },
  followingButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#48BB78',
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
})
