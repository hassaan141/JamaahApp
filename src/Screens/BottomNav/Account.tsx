import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NavigationProp } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
// SafeAreaView is no longer needed here
import { useAuthStatus } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import LoadingAnimation from '@/components/Loading/Loading'
import { supabase } from '@/Supabase/supabaseClient'
import type { Database } from '@/types'
import type { RootStackParamList } from '@/Screens/Navigation/RootNavigator'

type Organization = Database['public']['Tables']['organizations']['Row']

import UserProfileSection from '@/components/Account/UserProfileSection'
import CreateAnnouncementSection from '@/components/Account/CreateAnnouncementSection'
import AnnouncementsList from '@/components/Account/AnnouncementsList'
import FollowedOrgsList from '@/components/Account/FollowedOrgsList'
// import VersionFooter from '@/components/Account/VersionFooter'
import { useTheme } from '@/theme'

export default function Account() {
  const { theme } = useTheme()
  const { isLoggedIn, isVerified } = useAuthStatus()
  const { profile, loading, error, refetch } = useProfile()
  const [refreshing, setRefreshing] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const lastFetchedOrgId = useRef<string | null>(null)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const isOrganization = useMemo(
    () => profile?.is_org === true && !!profile?.org_id,
    [profile?.is_org, profile?.org_id],
  )

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!profile?.org_id || profile.org_id === lastFetchedOrgId.current)
        return

      lastFetchedOrgId.current = profile.org_id

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single()

      if (data && !error) {
        setOrganization(data)
      }
    }

    fetchOrganization()
  }, [profile?.org_id])

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn || !profile?.id) {
      setRefreshing(false)
      return
    }
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch, isLoggedIn, profile?.id])

  // Guest mode: Show sign-up prompt
  if (!isLoggedIn) {
    return (
      <View
        style={[
          styles.guestContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.guestContent}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.colors.primarySoft,
                borderColor: theme.colors.primaryBorder,
              },
            ]}
          >
            <Feather name="user" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: theme.colors.text }]}>
            Create an Account
          </Text>
          <Text
            style={[styles.guestSubtitle, { color: theme.colors.textMuted }]}
          >
            Sign up to follow masjids, get prayer notifications, and more
          </Text>
          <TouchableOpacity
            style={[
              styles.signUpButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.shadow,
              },
            ]}
            onPress={() => navigation.navigate('UserTypeSelection')}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text
              style={[styles.signInLinkText, { color: theme.colors.textMuted }]}
            >
              Already have an account?{' '}
              <Text
                style={[styles.signInBold, { color: theme.colors.primary }]}
              >
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
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
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.text }}>
          Error loading profile: {error.message}
        </Text>
      </View>
    )
  }

  return (
    // We now use a standard View instead of SafeAreaView
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* This spacer pushes content down from the status bar */}
        <View style={{ height: 56 }} />

        <UserProfileSection
          profile={profile}
          isVerified={isVerified}
          isOrganization={isOrganization}
        />

        {isOrganization && (
          <>
            <CreateAnnouncementSection profile={profile} />
            <AnnouncementsList
              profile={profile}
              refreshKey={refreshing}
              organization={organization}
            />
          </>
        )}

        <FollowedOrgsList refreshKey={refreshing} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  // Guest mode styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4732',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  signUpButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#2F855A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInLink: {
    marginTop: 20,
    padding: 8,
  },
  signInLinkText: {
    fontSize: 15,
    color: '#6C757D',
  },
  signInBold: {
    color: '#2F855A',
    fontWeight: '600',
  },
})
