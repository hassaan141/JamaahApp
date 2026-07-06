import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { getCoarseLocation } from '@/Utils/useLocation'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { DEFAULT_LOCATION } from '@/Utils/constants'
import { getUserId } from '@/Utils/getUserID'
import { setPinned } from '@/Utils/switchMasjidMode'
import { syncPrayerSubscription } from '@/Utils/pushNotifications'
import SearchBar from '@/components/SearchBar/SearchBar'
import MasjidListItem from '@/components/MasjidScreen/MasjidListItem'
import LoadingAnimation from '@/components/Loading/Loading'
import { toast } from '@/components/Toast/toast'
import { useTheme } from '@/theme'
import GradientBackground from '@/components/GradientBackground'

interface NavProps {
  navigation: { goBack: () => void }
  route?: { params?: { showBackButton?: boolean } }
}

type MasjidItem = {
  id: string
  name: string
  address: string
  distance_km?: number
}

const Masjids: React.FC<NavProps> = ({ navigation, route }) => {
  const { theme } = useTheme()
  const showBackButton = !!route?.params?.showBackButton

  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [masjids, setMasjids] = useState<MasjidItem[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const loc = await getCoarseLocation()
        setLocation(loc)
      } catch {
        setLocation(null)
      }
    })()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        // Use user location if available, otherwise use default
        const coords = location || DEFAULT_LOCATION
        const list = await fetchNearbyMasjids(
          coords.latitude,
          coords.longitude,
          { q: '', limit: 100 },
        )
        setMasjids(list)
      } catch (err) {
        console.error('Error loading masjids:', err)
        setError('Failed to fetch masjids. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location])

  const onChangeSearch = (text: string) => {
    setQ(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const coords = location || DEFAULT_LOCATION
        const list = await fetchNearbyMasjids(
          coords.latitude,
          coords.longitude,
          { q: text, limit: 100 },
        )
        setMasjids(list)
      } catch (e) {
        console.error('Search failed:', e)
      }
    }, 250)
  }

  const clearSearch = async () => {
    setQ('')
    try {
      const coords = location || DEFAULT_LOCATION
      const list = await fetchNearbyMasjids(coords.latitude, coords.longitude, {
        q: '',
        limit: 100,
      })
      setMasjids(list)
    } catch (e) {
      console.error('Reset search failed:', e)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const coords = location || DEFAULT_LOCATION
      const list = await fetchNearbyMasjids(coords.latitude, coords.longitude, {
        q,
        limit: 100,
      })
      setMasjids(list)
    } catch (e) {
      console.error('Refresh failed:', e)
    } finally {
      setRefreshing(false)
    }
  }

  const onSelectMasjid = async (orgId: string) => {
    setSelectingId(orgId)
    try {
      const userId = await getUserId()

      await setPinned(userId, orgId)

      await syncPrayerSubscription(orgId)

      toast.success('Masjid selected', 'Success')
      if (showBackButton && navigation) {
        try {
          navigation.goBack()
        } catch {
          console.debug('Navigation goBack failed - no screen to go back to')
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to select masjid', 'Error')
    } finally {
      setSelectingId(null)
    }
  }

  if (loading) {
    return (
      <GradientBackground>
        <LoadingAnimation />
        <Text
          style={{
            textAlign: 'center',
            marginTop: 16,
            color: theme.colors.textMuted,
          }}
        >
          Loading…
        </Text>
      </GradientBackground>
    )
  }

  const hasNoResults = masjids.length === 0

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Feather name="arrow-left" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
          <Text
            style={[
              styles.headerTitle,
              showBackButton && styles.headerTitleWithBack,
              { color: theme.colors.text },
            ]}
          >
            {showBackButton ? 'Choose Masjid' : 'Nearby Masjids'}
          </Text>
        </View>
      </View>

      {!!error && (
        <Text
          style={{
            color: theme.colors.danger,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {error}
        </Text>
      )}

      {hasNoResults ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.searchContainer}>
            <SearchBar
              value={q}
              onChangeText={onChangeSearch}
              onClear={clearSearch}
            />
          </View>
          <View style={styles.emptyWrap}>
            <Feather name="search" size={48} color={theme.colors.textSoft} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              {q.trim() ? `No masjids found for "${q}"` : 'No masjids found'}
            </Text>
            {!!q.trim() && (
              <TouchableOpacity
                onPress={clearSearch}
                style={[
                  styles.clearSearchButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.clearSearchText}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.searchContainer}>
            <SearchBar
              value={q}
              onChangeText={onChangeSearch}
              onClear={clearSearch}
            />
          </View>
          <View style={styles.list}>
            {masjids.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <MasjidListItem
                  item={item}
                  onPress={() => onSelectMasjid(item.id)}
                />
                {selectingId === item.id && (
                  <View
                    style={[
                      styles.loadingOverlay,
                      { backgroundColor: theme.colors.overlay },
                    ]}
                  >
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 5,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitleWithBack: { textAlign: 'left', flex: 1 },
  scrollContent: { flexGrow: 1 },
  searchContainer: { paddingHorizontal: 10, paddingBottom: 5 },
  list: { paddingHorizontal: 6, paddingTop: 5, paddingBottom: 16 },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  itemWrapper: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 8,
  },
  loadingScale: {
    transform: [{ scale: 0.6 }],
  },
})

export default Masjids
