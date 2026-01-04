import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native'
// SafeAreaView is no longer needed here
import { useAuth, useAuthStatus } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import LoadingAnimation from '@/components/Loading/Loading'
import { supabase } from '@/Supabase/supabaseClient'
import type { Database } from '@/types'

type Organization = Database['public']['Tables']['organizations']['Row']

import UserProfileSection from '@/components/Account/UserProfileSection'
import CreateAnnouncementSection from '@/components/Account/CreateAnnouncementSection'
import AnnouncementsList from '@/components/Account/AnnouncementsList'
import FollowedOrgsList from '@/components/Account/FollowedOrgsList'
import SignOutButton from '@/components/Account/SignOutButton'
// import VersionFooter from '@/components/Account/VersionFooter'

export default function Account() {
  const { logout } = useAuth()
  const { isLoggedIn, isVerified } = useAuthStatus()
  const { profile, loading, error, refetch } = useProfile()
  const [refreshing, setRefreshing] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const lastFetchedOrgId = useRef<string | null>(null)

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

  return (
    // We now use a standard View instead of SafeAreaView
    <View style={styles.container}>
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

        <SignOutButton onLogout={logout} />
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
    paddingBottom: 32, // Added more bottom padding for spacing
  },
})
