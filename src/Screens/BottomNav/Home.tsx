import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  // ActivityIndicator,
} from 'react-native'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import CombinedPrayerCard from '@/components/HomeScreen/CombinedPrayerCard'
import MasjidButton from '@/components/HomeScreen/MasjidButton'
import NotificationCard from '@/components/HomeScreen/NotificationButton'
import NotificationList from '@/components/HomeScreen/NotificationList'
import JummahCard from '@/components/HomeScreen/JummahCard'
import { usePrayerTimes } from '@/Hooks/usePrayerTimes'
import MiniLoading from '@/components/Loading/MiniLoading'

type HomeRouteParams = { refreshPrayerTimes?: boolean }
type NavigationLike = {
  setParams?: (params: Partial<HomeRouteParams>) => void
  navigate: (route: string, params?: Record<string, unknown>) => void
}

export default function Home({ navigation }: { navigation: NavigationLike }) {
  const {
    org,
    distance_m,
    times,
    todayTimes,
    refetchPrayerTimes,
    targetDate,
    nextDay,
    prevDay,
    mode,
    loading,
  } = usePrayerTimes()

  const [refreshing, setRefreshing] = useState(false)
  const route = useRoute() as { params?: HomeRouteParams }

  useEffect(() => {
    if (route?.params?.refreshPrayerTimes) {
      refetchPrayerTimes()
      navigation.setParams?.({ refreshPrayerTimes: undefined })
    }
  }, [route?.params?.refreshPrayerTimes, refetchPrayerTimes, navigation])

  useFocusEffect(
    useCallback(() => {
      refetchPrayerTimes().catch((err) =>
        console.log('Focus fetch failed:', err),
      )
    }, [refetchPrayerTimes]),
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network request timed out')), 10000),
      )
      await Promise.race([refetchPrayerTimes(), timeoutPromise])
    } catch (error) {
      console.log('Refresh skipped due to timeout or error:', error)
    } finally {
      setRefreshing(false)
    }
  }, [refetchPrayerTimes])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F7FAFC' }}
      contentContainerStyle={{ paddingBottom: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ height: 56 }} />
      <View style={styles.topRow}>
        <View style={styles.masjidContainer}>
          {loading && !org ? (
            <MiniLoading />
          ) : (
            <MasjidButton
              prayerTimes={{
                org: org ?? undefined,
                distance_m: distance_m ?? undefined,
              }}
              navigation={navigation}
              onRefreshPrayerTimes={refetchPrayerTimes}
              activeMode={mode}
            />
          )}
        </View>
        <View style={styles.notificationWrapper}>
          <NotificationCard navigation={navigation} />
        </View>
      </View>

      <JummahCard
        prayerTimes={todayTimes}
        org={org ? { name: org.name, timezone: org.timezone } : null}
      />

      <CombinedPrayerCard
        prayerTimes={todayTimes}
        modalPrayerTimes={times}
        orgName={org?.name}
        currentDate={targetDate}
        onNextDay={nextDay}
        onPrevDay={prevDay}
      />

      <NotificationList refreshKey={refreshing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  masjidContainer: {
    flex: 1,
  },
  notificationWrapper: {
    marginLeft: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
