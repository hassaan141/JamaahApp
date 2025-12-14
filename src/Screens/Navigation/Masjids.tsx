import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { getCoarseLocation } from '@/Utils/useLocation'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { getUserId } from '@/Utils/getUserID'
import { setPinned } from '@/Utils/switchMasjidMode'
import MasjidSearchBar from '@/components/MasjidScreen/MasjidSearchBar'
import MasjidListItem from '@/components/MasjidScreen/MasjidListItem'
import LoadingAnimation from '@/components/Loading/Loading'
import { toast } from '@/components/Toast/toast'

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
  const showBackButton = !!route?.params?.showBackButton

  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [masjids, setMasjids] = useState<MasjidItem[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // simple one-time coarse location; replace with dedicated hook if desired
    ;(async () => {
      try {
        const loc = await getCoarseLocation()
        setLocation(loc)
      } catch {
        setError('Location permission denied')
      }
    })()
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!location) return
      try {
        const list = await fetchNearbyMasjids(
          location.latitude,
          location.longitude,
          { q: '', limit: 15 },
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
    if (!location) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const list = await fetchNearbyMasjids(
          location.latitude,
          location.longitude,
          { q: text, limit: 15 },
        )
        setMasjids(list)
      } catch (e) {
        console.error('Search failed:', e)
      }
    }, 250)
  }

  const clearSearch = async () => {
    setQ('')
    if (!location) return
    try {
      const list = await fetchNearbyMasjids(
        location.latitude,
        location.longitude,
        { q: '', limit: 15 },
      )
      setMasjids(list)
    } catch (e) {
      console.error('Reset search failed:', e)
    }
  }

  const onSelectMasjid = async (orgId: string) => {
    try {
      const userId = await getUserId()
      await setPinned(userId, orgId)
      toast.success('Masjid selected', 'Success')
      if (showBackButton && navigation) navigation.goBack()
    } catch (e) {
      console.error(e)
      toast.error('Failed to select masjid', 'Error')
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingAnimation />
        <Text style={{ textAlign: 'center', marginTop: 16 }}>Loading…</Text>
      </View>
    )
  }

  const hasNoResults = masjids.length === 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="#228f2bff" />
            </TouchableOpacity>
          )}
          <Text
            style={[
              styles.headerTitle,
              showBackButton && styles.headerTitleWithBack,
            ]}
          >
            {showBackButton ? 'Choose Masjid' : 'Nearby Masjids'}
          </Text>
        </View>
      </View>

      {!!error && (
        <Text
          style={{ color: '#E53E3E', textAlign: 'center', marginBottom: 8 }}
        >
          {error}
        </Text>
      )}

      <MasjidSearchBar
        value={q}
        onChangeText={onChangeSearch}
        onClear={clearSearch}
      />

      {hasNoResults ? (
        <View style={styles.emptyWrap}>
          <Feather name="search" size={48} color="#CBD5E0" />
          <Text style={styles.emptyText}>
            {q.trim()
              ? `No masjids found for "${q}"`
              : 'No masjids found in your area'}
          </Text>
          {!!q.trim() && (
            <TouchableOpacity
              onPress={clearSearch}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={masjids}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MasjidListItem
              item={item}
              onPress={() => onSelectMasjid(item.id)}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC', padding: 10 },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 5,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228f2bff',
    textAlign: 'center',
    flex: 1,
  },
  headerTitleWithBack: { textAlign: 'left', flex: 1 },
  list: { paddingHorizontal: 6, paddingVertical: 16 },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: '#48BB78',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
})

export default Masjids
