import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, RefreshControl, View } from 'react-native'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import Header from '@/components/Header/Header'
import NextPrayerCard from '@/components/HomeScreen/NextPrayerCard'
import MasjidButton from '@/components/HomeScreen/MasjidButton'
import PrayerTimesTable from '@/components/HomeScreen/PrayerTimesTable'
import NotificationList from '@/components/HomeScreen/NotificationList'
import { usePrayerTimes } from '@/Hooks/usePrayerTimes'

type HomeRouteParams = { refreshPrayerTimes?: boolean }
type NavigationLike = {
  setParams?: (params: Partial<HomeRouteParams>) => void
  navigate: (route: string, params?: Record<string, unknown>) => void
}

export default function Home({ navigation }: { navigation: NavigationLike }) {
  const { loading, org, distance_m, times, refetchPrayerTimes } =
    usePrayerTimes()
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
      refetchPrayerTimes()
    }, [refetchPrayerTimes]),
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetchPrayerTimes()
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
      <Header title="Jamaah" showDate={false} showClock={false} />

      <View style={{ height: 8 }} />
      <NextPrayerCard prayerTimes={times} />
      <MasjidButton
        prayerTimes={{
          org: org ?? undefined,
          distance_m: distance_m ?? undefined,
        }}
        navigation={navigation}
        onRefreshPrayerTimes={refetchPrayerTimes}
      />
      <PrayerTimesTable loading={loading} prayerTimes={times} />
      <NotificationList />
    </ScrollView>
  )
}
