import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useAuthStatus } from '@/Auth/AuthProvider'
import { useProfile } from '@/Auth/fetchProfile'
import LoadingAnimation from '@/components/Loading/Loading'

import UserProfileSection from '@/components/Account/UserProfileSection'
import CreateAnnouncementSection from '@/components/Account/CreateAnnouncementSection'
import AnnouncementsList from '@/components/Account/AnnouncementsList'
import EventsList from '@/components/Account/EventsList'
import SignOutButton from '@/components/Account/SignOutButton'
import VersionFooter from '@/components/Account/VersionFooter'

export default function Account() {
  const { logout } = useAuth()
  const { isLoggedIn, isVerified } = useAuthStatus()
  const { profile, loading, error, refetch } = useProfile()
  const [refreshing, setRefreshing] = useState(false)

  const isOrganization = useMemo(
    () => profile?.is_org === true && !!profile?.org_id,
    [profile?.is_org, profile?.org_id],
  )

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
    <SafeAreaView style={styles.container}>
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
        <UserProfileSection
          profile={profile}
          isVerified={isVerified}
          isOrganization={!!isOrganization}
        />

        {isOrganization ? (
          <>
            <CreateAnnouncementSection profile={profile} />
            <AnnouncementsList profile={profile} />
          </>
        ) : (
          <EventsList profile={profile} />
        )}

        <SignOutButton onLogout={logout} />

        <VersionFooter
          styles={{
            versionContainer: { alignItems: 'center', paddingVertical: 20 },
            versionText: { fontSize: 12, color: '#6C757D' },
          }}
        />
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    paddingBottom: 40,
  },
})
