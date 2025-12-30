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
import SearchBar from '@/components/SearchBar/SearchBar'
import MapHeader from '@/components/Map/MapHeader'
import MapTabs from '@/components/Map/MapTabs'
import CompactMapView from '@/components/Map/CompactMapView'
import MasjidList from '@/components/Map/MasjidList'
import EventList from '@/components/Map/EventList'
import NoResults from '@/components/Map/NoResults'
import { useLocation } from '@/Utils/useLocation'
import MiniLoading from '@/components/Loading/MiniLoading'
import { openDirections, openCall } from '@/Utils/links'

// 1. Import your new hooks and types
import { useMasjidList, type MasjidItem } from '@/Hooks/useMasjidList'
import { useEventList } from '@/Hooks/useEventList' // <--- NEW: Import the event hook
import type { EventItem } from '@/Supabase/fetchEventsFromRPC' // <--- NEW: Import correct type

// Define a base type for events in the list, which may not have the calculated distance
type EventListEvent = Omit<EventItem, 'dist_km'>

export default function MapScreen() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mapMode, setMapMode] = useState<'masjids' | 'events'>('events')

  // 2. Remove the old "events" useState and useEffect.
  // We don't need manual fetching anymore.

  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const { location } = useLocation()

  // 3. Initialize BOTH hooks
  const masjidLogic = useMasjidList(location)
  const eventLogic = useEventList(location) // <--- NEW: Init event logic

  // 4. Create "Dynamic" variables based on the current mode
  // This acts as the "Traffic Controller" for your UI
  const isMasjidMode = mapMode === 'masjids'

  const currentSearchQuery = isMasjidMode
    ? masjidLogic.searchQuery
    : eventLogic.searchQuery

  const currentLoading = isMasjidMode ? masjidLogic.loading : eventLogic.loading

  const currentError = isMasjidMode ? masjidLogic.error : eventLogic.error

  const handleUnifiedSearch = (text: string) => {
    if (isMasjidMode) {
      masjidLogic.handleSearch(text)
    } else {
      eventLogic.handleSearch(text)
    }
  }

  const handleUnifiedClear = () => {
    if (isMasjidMode) {
      masjidLogic.handleClearSearch()
    } else {
      eventLogic.handleClearSearch()
    }
  }

  const handleUnifiedRefresh = () => {
    if (isMasjidMode) {
      masjidLogic.onRefresh()
    } else {
      eventLogic.onRefresh()
    }
  }

  // --- Handlers ---

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

  // Updated to use EventListEvent type
  const handleEventPress = (event: EventListEvent) => {
    console.log('Event selected:', event?.title)
  }

  const handleEventDirections = (event: EventListEvent) => {
    if (event.lat && event.long) {
      openDirections({
        userLat: location?.latitude ?? null,
        userLon: location?.longitude ?? null,
        destLat: event.lat,
        destLon: event.long,
        destAddress: event.location || null, // Updated to match new RPC return
        placeLabel: event.title ?? '',
      })
    }
  }

  // --- Animation Logic (Unchanged) ---
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
          <RefreshControl
            refreshing={
              isMasjidMode ? masjidLogic.refreshing : eventLogic.refreshing
            }
            onRefresh={handleUnifiedRefresh}
          />
        }
      >
        <View style={styles.searchContainer}>
          {/* 5. Update Search Bar to use Unified Handlers */}
          <SearchBar
            value={currentSearchQuery}
            onChangeText={handleUnifiedSearch}
            onClear={handleUnifiedClear}
            placeholder={
              isMasjidMode
                ? 'Search for masjids nearby...'
                : "Search events ('Quran', 'Sisters')..."
            }
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

        {currentLoading && (
          <View style={styles.loadingContainer}>
            <MiniLoading />
            <Text style={styles.loadingText}>
              {isMasjidMode ? 'Loading masjids...' : 'Loading events...'}
            </Text>
          </View>
        )}

        {currentError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{currentError}</Text>
          </View>
        )}

        {!currentLoading && !currentError && (
          <View style={styles.masjidListContainer}>
            <Text style={styles.masjidListTitle}>
              {isMasjidMode
                ? currentSearchQuery
                  ? `Search Results (${masjidLogic.filteredMasjids.length})`
                  : 'Nearest Masjids'
                : currentSearchQuery
                  ? `Search Results (${eventLogic.events.length})`
                  : 'Upcoming Events & Classes'}
            </Text>

            {/* 6. Render the Correct List based on mode */}
            {isMasjidMode ? (
              masjidLogic.filteredMasjids.length === 0 ? (
                <NoResults
                  message={
                    currentSearchQuery.trim() === ''
                      ? 'No masjids found in your area'
                      : `No masjids found for "${currentSearchQuery}"`
                  }
                />
              ) : (
                <MasjidList
                  items={
                    currentSearchQuery
                      ? masjidLogic.filteredMasjids
                      : masjidLogic.filteredMasjids.slice(0, 3)
                  }
                  onPress={handleMasjidPress}
                  onDirections={handleDirections}
                  onCall={handleCall}
                />
              )
            ) : eventLogic.events.length === 0 ? (
              <NoResults message="No events found" />
            ) : (
              <EventList
                // We slice(0,3) because this is just the "Preview" list
                // The full list would be in a separate "See All" screen or similar
                items={eventLogic.events.slice(0, 3)}
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

// ... Styles remain exactly the same ...
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
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 4 },
  expandedTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  placeholder: { width: 32 },
  expandedMapContainer: { flex: 1 },
})
