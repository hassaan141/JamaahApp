import React, { useCallback, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { Profile } from '@/types'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import { fetchOrgPostCount } from '@/Supabase/fetchOrgPostCount'
import { fetchOrganizationByProfileId } from '@/Supabase/fetchOrgFromProfileId'
import { toast } from '@/components/Toast/toast'

type MinimalNav = {
  getState?: () => { routeNames?: string[] }
  navigate?: (name: string) => void
}

export default function UserProfileSection({
  profile,
  isVerified,
  isOrganization,
}: {
  profile: Partial<Profile> | null
  isVerified: boolean
  isOrganization: boolean
}) {
  const navigation = useNavigation() as unknown as MinimalNav
  const [postCount, setPostCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [organizationDescription, setOrganizationDescription] = useState<
    string | null
  >(null)

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      if (!isOrganization) return

      try {
        const organization = await fetchOrganizationByProfileId()
        setOrganizationName(organization?.name || null)
        setOrganizationDescription(organization?.description || null)
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }

    fetchOrganizationDetails()
  }, [isOrganization])

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
      console.error(
        '[UserProfile] Failed to load organization counts',
        countError,
      )
      return { posts: 0, followers: 0 }
    }
  }, [isOrganization, profile?.org_id])

  useEffect(() => {
    const loadData = async () => {
      if (isOrganization && profile?.org_id) {
        const counts = await loadOrgCounts()
        setPostCount(counts.posts)
        setFollowerCount(counts.followers)
      }
    }
    loadData()
  }, [isOrganization, profile?.org_id, loadOrgCounts])

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

  const displayName = isOrganization
    ? organizationName || 'Organization'
    : profile?.first_name || 'User'

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
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
  })

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#2F855A',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 14,
            }}
          >
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: '600', color: '#1D4732' }}
              >
                {displayName}
              </Text>
            </View>

            {/* Only show posts and followers for organizations */}
            {isOrganization && (
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text
                  style={{ fontSize: 14, color: '#1D4732', marginRight: 16 }}
                >
                  <Text style={{ fontWeight: '600' }}>{postCount}</Text>
                  <Text style={{ color: '#6C757D' }}> posts</Text>
                </Text>
                <Text style={{ fontSize: 14, color: '#1D4732' }}>
                  <Text style={{ fontWeight: '600' }}>{followerCount}</Text>
                  <Text style={{ color: '#6C757D' }}> followers</Text>
                </Text>
              </View>
            )}

            {isOrganization && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#E8F5E9',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Feather name="briefcase" size={12} color="#2F855A" />
                <Text
                  style={{
                    fontSize: 12,
                    color: '#2F855A',
                    marginLeft: 4,
                    fontWeight: '500',
                  }}
                >
                  Organization
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleOpenSettings}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F8F9FA',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Feather name="settings" size={20} color="#1D4732" />
          </TouchableOpacity>
        </View>

        <View>
          {!isOrganization && profile?.first_name && profile?.last_name && (
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#1D4732',
                marginBottom: 4,
              }}
            >
              {profile.first_name} {profile.last_name}
            </Text>
          )}

          {profile?.country && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Feather name="map-pin" size={13} color="#6C757D" />
              <Text style={{ fontSize: 13, color: '#6C757D', marginLeft: 4 }}>
                {profile.country}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 13, color: '#495057', lineHeight: 18 }}>
            {isOrganization
              ? organizationDescription ||
                'Serving the Islamic community with announcements and events'
              : 'Serving the Islamic community with announcements and events'}
          </Text>
        </View>
      </View>

      {!isVerified && (
        <View style={styles.verifyBanner}>
          <Text style={styles.verifyText}>📧 Please verify your email</Text>
        </View>
      )}
    </>
  )
}
