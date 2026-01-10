import React, { useCallback, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { Profile } from '@/types'
import { fetchOrgFollowerCount } from '@/Supabase/fetchOrgFollowerCount'
import { fetchOrgPostCount } from '@/Supabase/fetchOrgPostCount'
import { fetchOrganizationByProfileId } from '@/Supabase/fetchOrgFromProfileId'
import { supabase } from '@/Supabase/supabaseClient'

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

            {/* Show email for individuals */}
            {!isOrganization && profile?.email && !isAppleUser && (
              <Text
                style={{ fontSize: 13, color: '#6C757D', marginBottom: 4 }}
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

            {/* Show member badge for individuals */}
            {!isOrganization && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#EBF8FF',
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
              backgroundColor: '#F8F9FA',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 12,
              alignSelf: 'flex-start',
            }}
          >
            <Feather name="settings" size={20} color="#1D4732" />
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
                  color: '#6C757D',
                  marginLeft: 6,
                }}
              >
                Member since {memberSince}
              </Text>
            </View>
          )}

          {isOrganization && organizationDescription && (
            <Text style={{ fontSize: 13, color: '#495057', lineHeight: 18 }}>
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
