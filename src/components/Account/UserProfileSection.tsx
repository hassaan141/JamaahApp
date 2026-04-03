import React, { useCallback, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { Profile } from '@/types'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import { fetchOrgPostCount } from '@/Supabase/fetchOrgPostCount'
import { fetchOrganizationByProfileId } from '@/Supabase/fetchOrgFromProfileId'
import { supabase } from '@/Supabase/supabaseClient'
import { useTheme } from '@/theme'

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
  const { theme } = useTheme()
  const [postCount, setPostCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [organizationDescription, setOrganizationDescription] = useState<
    string | null
  >(null)
  const [isAppleUser, setIsAppleUser] = useState(false)

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

    const checkAppleAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.identities?.some((i) => i.provider === 'apple')) {
        setIsAppleUser(true)
      }
    }

    fetchOrganizationDetails()
    checkAppleAuth()
  }, [isOrganization])

  const loadOrgCounts = useCallback(async () => {
    if (!isOrganization || !profile?.org_id) {
      return { posts: 0, followers: 0 }
    }

    try {
      const [posts, followers] = await Promise.all([
        fetchOrgPostCount(profile.org_id),
        fetchOrgFollowerCount(profile.org_id),
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
    if (navigation.navigate) {
      navigation.navigate('Settings' as never)
    }
  }, [navigation])

  const displayName = isOrganization
    ? organizationName || 'Organization'
    : profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || 'User'

  // Format member since date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null

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
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
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
              backgroundColor: theme.colors.primary,
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
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}
              >
                {displayName}
              </Text>
            </View>

            {/* Only show posts and followers for organizations */}
            {isOrganization && (
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>{postCount}</Text>
                  <Text style={{ color: theme.colors.textMuted }}> posts</Text>
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.text }}>
                  <Text style={{ fontWeight: '600' }}>{followerCount}</Text>
                  <Text style={{ color: theme.colors.textMuted }}>
                    {' '}
                    followers
                  </Text>
                </Text>
              </View>
            )}

            {/* Show email for individuals */}
            {!isOrganization && profile?.email && !isAppleUser && (
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {profile.email}
              </Text>
            )}

            {isOrganization && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.primarySoft,
                  borderWidth: 1,
                  borderColor: theme.colors.primaryBorder,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Feather
                  name="briefcase"
                  size={12}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.primary,
                    marginLeft: 4,
                    fontWeight: '500',
                  }}
                >
                  Organization
                </Text>
              </View>
            )}

            {/* Show member badge for individuals */}
            {!isOrganization && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceMuted,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Feather name="user" size={12} color="#3182CE" />
                <Text
                  style={{
                    fontSize: 12,
                    color: '#3182CE',
                    marginLeft: 4,
                    fontWeight: '500',
                  }}
                >
                  Member
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleOpenSettings}
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 12,
              alignSelf: 'flex-start',
            }}
          >
            <Feather name="settings" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View>
          {/* Show member since for individuals */}
          {!isOrganization && memberSince && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Feather name="calendar" size={14} color="#6C757D" />
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  marginLeft: 6,
                }}
              >
                Member since {memberSince}
              </Text>
            </View>
          )}

          {isOrganization && organizationDescription && (
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textMuted,
                lineHeight: 18,
              }}
            >
              {organizationDescription}
            </Text>
          )}
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
