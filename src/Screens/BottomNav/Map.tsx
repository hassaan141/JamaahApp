import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import DetailedMap from '@/components/Map/DetailedMap'
import MasjidSearchBar from '@/components/MasjidScreen/MasjidSearchBar'
import MapHeader from '@/components/Map/MapHeader'
import MapTabs from '@/components/Map/MapTabs'
import CompactMapView from '@/components/Map/CompactMapView'
import MasjidList from '@/components/Map/MasjidList'
import EventList from '@/components/Map/EventList'
import NoResults from '@/components/Map/NoResults'
import { useLocation } from '@/Utils/useLocation'
import LoadingAnimation from '@/components/Loading/Loading'
import { openDirections, openCall } from '@/Utils/links'
import { useMasjidList, type MasjidItem } from '@/Hooks/useMasjidList'
import { fetchAnnouncements } from '@/Supabase/fetchAllAnnouncements'
import type { OrgPost } from '@/types'

export default function MapScreen() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mapMode, setMapMode] = useState<'masjids' | 'events'>('masjids')
  const [events, setEvents] = useState<OrgPost[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const { location } = useLocation()
  const {
    filteredMasjids,
    loading,
    error,
    refreshing,
    searchQuery,
    handleSearch,
    handleClearSearch,
    onRefresh,
  } = useMasjidList(location as { latitude: number; longitude: number } | null)

  const handleMasjidPress = (masjid: MasjidItem) => {
    console.log('Masjid selected:', masjid?.name)
  }

  const handleDirections = (masjid: MasjidItem) => {
    const fullAddress = [
      masjid?.address,
      masjid?.city,
      masjid?.province_state,
      masjid?.country,
    ]
      .filter(Boolean)
      .join(', ')
    openDirections({
      userLat: location?.latitude ?? null,
      userLon: location?.longitude ?? null,
      destLat: masjid?.latitude,
      destLon: masjid?.longitude,
      destAddress: fullAddress || null,
      placeLabel: masjid?.name ?? '',
    })
  }

  const handleCall = (masjid: MasjidItem) => {
    openCall(masjid?.contact_phone || masjid?.phone)
  }

  const handleEventPress = (event: OrgPost) => {
    console.log('Event selected:', event?.title)
  }

  const handleEventDirections = (event: OrgPost) => {
    if (event.lat && event.long) {
      openDirections({
        userLat: location?.latitude ?? null,
        userLon: location?.longitude ?? null,
        destLat: event.lat,
        destLon: event.long,
        destAddress: event.location || null,
        placeLabel: event.title ?? '',
      })
    }
  }

  // Load events when tab changes to events
  React.useEffect(() => {
    if (mapMode === 'events') {
      setEventsLoading(true)
      fetchAnnouncements()
        .then((data) => setEvents(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error loading events:', err))
        .finally(() => setEventsLoading(false))
    }
  }, [mapMode])

  const expandMap = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(true)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const collapseMap = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  if (isExpanded) {
    return (
      <Animated.View style={[styles.expandedContainer, { opacity: fadeAnim }]}>
        <View style={styles.expandedHeader}>
          <TouchableOpacity style={styles.backButton} onPress={collapseMap}>
            <Feather name="chevron-left" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.expandedTitle}>Map</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={{ backgroundColor: '#fff' }}>
          <MapTabs selectedTab={mapMode} onTabChange={setMapMode} />
        </View>
        <View style={styles.expandedMapContainer}>
          <DetailedMap mode={mapMode} />
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchContainer}>
          <MasjidSearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search for masjids nearby..."
          />
        </View>

        <View style={styles.compactMapContainer}>
          <MapHeader
            onExpand={expandMap}
            selectedTab={mapMode}
            onTabChange={setMapMode}
          />
          <CompactMapView mode={mapMode} />
        </View>

        {(loading || eventsLoading) && (
          <View style={styles.loadingContainer}>
            <LoadingAnimation />
            <Text style={styles.loadingText}>
              {mapMode === 'masjids'
                ? 'Loading masjids...'
                : 'Loading events...'}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !eventsLoading && (
          <View style={styles.masjidListContainer}>
            <Text style={styles.masjidListTitle}>
              {mapMode === 'masjids'
                ? searchQuery
                  ? `Search Results (${filteredMasjids.length})`
                  : 'Nearest Masjids'
                : 'Upcoming Events & Classes'}
            </Text>
            {mapMode === 'masjids' ? (
              filteredMasjids.length === 0 ? (
                <NoResults
                  message={
                    searchQuery.trim() === ''
                      ? 'No masjids found in your area'
                      : `No masjids found for "${searchQuery}"`
                  }
                />
              ) : (
                <MasjidList
                  items={
                    searchQuery ? filteredMasjids : filteredMasjids.slice(0, 3)
                  }
                  onPress={handleMasjidPress}
                  onDirections={handleDirections}
                  onCall={handleCall}
                />
              )
            ) : events.length === 0 ? (
              <NoResults message="No events found" />
            ) : (
              <EventList
                items={events.slice(0, 3)}
                onPress={handleEventPress}
                onDirections={handleEventDirections}
              />
            )}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  content: { flex: 1 },
  searchContainer: { padding: 20, paddingBottom: 10, marginTop: 40 },
  compactMapContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mapTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  expandButton: { padding: 4 },
  compactMap: {
    height: 200,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: { fontSize: 16, color: '#E53E3E', textAlign: 'center' },
  masjidListContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  masjidListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  noResultsContainer: { alignItems: 'center', paddingVertical: 40 },
  noResultsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
  },
  expandedContainer: { flex: 1, backgroundColor: '#F7FAFC' },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 4 },
  expandedTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  placeholder: { width: 32 },
  expandedMapContainer: { flex: 1 },
})
