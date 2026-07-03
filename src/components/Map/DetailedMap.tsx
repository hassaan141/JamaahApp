import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Camera as MapLibreCamera,
  MapView as MapLibreMapView,
  PointAnnotation,
  UserLocation,
} from '@maplibre/maplibre-react-native'
import MapView, { Marker, Circle, Callout } from 'react-native-maps'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Feather from '@expo/vector-icons/Feather'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { fetchAnnouncements } from '@/Supabase/fetchAllAnnouncements'
import { useLocation } from '@/Utils/useLocation'
import type { MasjidItem } from '@/Hooks/useMasjidList'
import type { OrgPost } from '@/types'
import AnnouncementModal from '@/components/Shared/AnnouncementModal'
import { isAnnouncementUpcoming } from '@/Utils/announcementVisibility'
import { announcementEventEmitter } from '@/Utils/announcementEventEmitter'
import {
  getEventTypeColor,
  getEventTypeIcon,
} from '@/components/Shared/announcementUtils'

// Local import for iOS only
import mosqueIcon from '../../../assets/mosque_new.png'
import { DEFAULT_LOCATION } from '@/Utils/constants'

const OPEN_STREET_MAP_STYLE = {
  version: 8,
  sources: {
    openstreetmap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'openstreetmap',
      type: 'raster',
      source: 'openstreetmap',
    },
  ],
} as const

const AndroidMapMarker = ({
  iconName,
  iconColor,
  count,
}: {
  iconName: React.ComponentProps<typeof Feather>['name']
  iconColor: string
  count?: number
}) => (
  <View>
    <View
      style={[styles.androidMarkerContainer, { backgroundColor: iconColor }]}
    >
      <Feather name={iconName} size={16} color="white" />
    </View>
    {count && count > 1 ? (
      <View style={styles.androidMarkerCountBadge}>
        <Text style={styles.androidMarkerCountText}>{count}</Text>
      </View>
    ) : null}
  </View>
)

// Only refetch nearby data after moving this far; keeps the map usable in a
// moving car instead of reloading on every 100m location tick.
const REFETCH_DISTANCE_THRESHOLD = 2000 // meters

function metersBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const DetailedMap: React.FC<{ mode?: 'masjids' | 'events' }> = ({
  mode = 'masjids',
}) => {
  const navigation = useNavigation() as unknown as {
    navigate?: (route: string, params?: Record<string, unknown>) => void
  }
  const { location, isLocationReady } = useLocation()

  const [nearbyMasjids, setNearbyMasjids] = useState<MasjidItem[]>([])
  const [events, setEvents] = useState<OrgPost[]>([])
  const [selectedMasjid, setSelectedMasjid] = useState<MasjidItem | null>(null)
  const [selectedEventGroup, setSelectedEventGroup] = useState<OrgPost[]>([])
  const [selectedEvent, setSelectedEvent] = useState<OrgPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Camera is centered on the FIRST fix only, then left alone so panning is
  // never fought by location updates. Captured once, never reassigned.
  const initialCenterRef = useRef<{ lat: number; lng: number } | null>(null)
  if (!initialCenterRef.current && location) {
    initialCenterRef.current = {
      lat: location.latitude,
      lng: location.longitude,
    }
  }

  // Location + mode the nearby list was last fetched for (refetch gate).
  const lastFetchLocation = useRef<{ lat: number; lon: number } | null>(null)
  const lastFetchMode = useRef<string | null>(null)

  const mapRef = useRef<MapView>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      setError(null)
      setSelectedMasjid(null)
      setSelectedEvent(null)
      if (mode === 'masjids') {
        // Use user location if available, otherwise use default
        const coords = location || DEFAULT_LOCATION
        const initialList = await fetchNearbyMasjids(
          coords.latitude,
          coords.longitude,
        )
        setNearbyMasjids(initialList as MasjidItem[])
      } else {
        const posts = await fetchAnnouncements()
        setEvents(posts.filter((post) => isAnnouncementUpcoming(post)))
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to load data')
    } finally {
      setLoading(false)
      setHasLoadedOnce(true)
    }
  }, [location, mode])

  // Refetch when the mode changes, or when the user moves far enough. Small
  // location ticks (e.g. driving) are ignored so the data stays stable.
  useEffect(() => {
    // A mode switch (masjids <-> events) must always refetch, regardless of
    // whether the user has moved.
    const modeChanged = lastFetchMode.current !== mode

    if (!location) {
      // No fix yet. Only fall back to the default location once we know a fix
      // isn't coming (permission denied / guest done); otherwise keep waiting
      // so the camera can center on the real first fix instead of the default.
      if (isLocationReady && (!hasLoadedOnce || modeChanged)) {
        lastFetchMode.current = mode
        loadData()
      }
      return
    }

    const prev = lastFetchLocation.current
    const movedFar =
      !prev ||
      metersBetween(prev.lat, prev.lon, location.latitude, location.longitude) >
        REFETCH_DISTANCE_THRESHOLD

    if (movedFar || modeChanged || !hasLoadedOnce) {
      lastFetchLocation.current = {
        lat: location.latitude,
        lon: location.longitude,
      }
      lastFetchMode.current = mode
      loadData()
    }
    // Depend on the raw coords, not loadData, so a moving location updating
    // loadData's identity doesn't itself trigger a refetch.
     
  }, [location?.latitude, location?.longitude, mode, isLocationReady])

  useEffect(() => {
    if (mode !== 'events') return

    const unsubscribe = announcementEventEmitter.subscribe(async () => {
      try {
        const posts = await fetchAnnouncements()
        setEvents(posts.filter((post) => isAnnouncementUpcoming(post)))
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Failed to load data')
      }
    })

    return unsubscribe
  }, [mode])

  const groupedAndroidEvents = useMemo(() => {
    const groups = new Map<string, OrgPost[]>()
    events
      .filter((event) => event.lat && event.long)
      .forEach((event) => {
        const key = `${event.lat!.toFixed(5)}:${event.long!.toFixed(5)}`
        const existing = groups.get(key) || []
        existing.push(event)
        groups.set(key, existing)
      })

    return Array.from(groups.entries()).map(([key, grouped]) => {
      const [lat, lng] = key.split(':').map(Number)
      return {
        key,
        lat,
        lng,
        events: grouped,
        leadEvent: grouped[0],
      }
    })
  }, [events])

  // Only block the whole screen on the very first load. Later refreshes
  // (mode change, moving far) update data silently under a mounted map so
  // the user's pan/zoom is never thrown away.
  if (!hasLoadedOnce && (loading || !isLocationReady)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2F855A" />
      </View>
    )
  }

  if (error && !hasLoadedOnce) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    )
  }

  // Camera center is fixed at the first fix (or default) and does NOT follow
  // live location, so location updates never recenter/fight the user's pan.
  const mapCenter = initialCenterRef.current || {
    lat: DEFAULT_LOCATION.latitude,
    lng: DEFAULT_LOCATION.longitude,
  }

  // --- ANDROID RENDER ---
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <MapLibreMapView
          style={styles.map}
          mapStyle={OPEN_STREET_MAP_STYLE}
          logoEnabled={false}
          attributionEnabled
          compassEnabled
          compassViewPosition={1}
          rotateEnabled
          pitchEnabled={false}
        >
          <MapLibreCamera
            defaultSettings={{
              centerCoordinate: [mapCenter.lng, mapCenter.lat],
              zoomLevel: 14.5,
            }}
          />
          {location ? (
            <UserLocation visible animated androidRenderMode="normal" />
          ) : null}

          {mode === 'masjids' &&
            nearbyMasjids
              .filter((marker) => marker.latitude && marker.longitude)
              .map((marker, index) => (
                <PointAnnotation
                  key={marker.id ?? index}
                  id={`masjid-${marker.id ?? index}`}
                  coordinate={[marker.longitude!, marker.latitude!]}
                  title={marker.name}
                  onSelected={() => {
                    setSelectedMasjid(marker)
                  }}
                >
                  <AndroidMapMarker iconName="map-pin" iconColor="#2F855A" />
                </PointAnnotation>
              ))}

          {mode === 'events' &&
            groupedAndroidEvents.map((group, index) => (
              <PointAnnotation
                key={group.leadEvent.id ?? index}
                id={`event-${group.leadEvent.id ?? index}`}
                coordinate={[group.lng, group.lat]}
                title={group.leadEvent.title}
                snippet={group.leadEvent.organizations?.name || ''}
                onSelected={() => {
                  if (group.events.length === 1) {
                    setSelectedEventGroup([])
                    setSelectedEvent(group.events[0])
                    return
                  }
                  setSelectedEvent(null)
                  setSelectedEventGroup(group.events)
                }}
              >
                <AndroidMapMarker
                  iconName={getEventTypeIcon(group.leadEvent.post_type)}
                  iconColor={getEventTypeColor(group.leadEvent.post_type)}
                  count={group.events.length}
                />
              </PointAnnotation>
            ))}
        </MapLibreMapView>

        {selectedMasjid ? (
          <View style={styles.androidMapCardWrap}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.androidMapCard}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('OrganizationDetail', {
                    org: selectedMasjid,
                  })
                }
              }}
            >
              <View style={styles.androidMapCardHeader}>
                <Text style={styles.androidMapCardTitle} numberOfLines={1}>
                  {selectedMasjid.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedMasjid(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={18} color="#52796F" />
                </TouchableOpacity>
              </View>
              <View style={styles.androidMapCardFooter}>
                <Text style={styles.androidMapCardLink}>Open organization</Text>
                <Feather name="arrow-up-right" size={14} color="#2F855A" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {selectedEventGroup.length > 1 ? (
          <View style={styles.androidMapCardWrap}>
            <View style={styles.androidEventGroupCard}>
              <View style={styles.androidMapCardHeader}>
                <Text style={styles.androidMapCardTitle}>
                  {selectedEventGroup.length} events here
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedEventGroup([])}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={18} color="#52796F" />
                </TouchableOpacity>
              </View>
              {selectedEventGroup.slice(0, 4).map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.androidEventGroupRow}
                  onPress={() => {
                    setSelectedEventGroup([])
                    setSelectedEvent(event)
                  }}
                >
                  <View
                    style={[
                      styles.androidEventGroupDot,
                      { backgroundColor: getEventTypeColor(event.post_type) },
                    ]}
                  />
                  <Text style={styles.androidEventGroupTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Feather name="chevron-right" size={16} color="#52796F" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {selectedEvent ? (
          <AnnouncementModal
            visible
            onClose={() => setSelectedEvent(null)}
            announcement={selectedEvent}
          />
        ) : null}
      </View>
    )
  }

  // --- iOS RENDER ---
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={!!location}
        showsMyLocationButton={!!location}
        followsUserLocation={false}
      >
        {/* <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          pinColor="blue"
        /> */}

        {mode === 'masjids' &&
          nearbyMasjids.map((marker, index) => (
            <React.Fragment key={marker.id ?? index}>
              <Marker
                coordinate={{
                  latitude: marker.latitude ?? 0,
                  longitude: marker.longitude ?? 0,
                }}
                tracksViewChanges={false}
              >
                {/* iOS uses the imported image directly */}
                <Image
                  source={mosqueIcon}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
                <Callout>
                  <TouchableOpacity
                    onPress={() => {
                      if (navigation?.navigate) {
                        navigation.navigate('OrganizationDetail', {
                          org: marker,
                        })
                      }
                    }}
                    style={styles.calloutContainer}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.calloutTitle}>{marker.name}</Text>
                  </TouchableOpacity>
                </Callout>
              </Marker>

              <Circle
                center={{
                  latitude: marker.latitude ?? 0,
                  longitude: marker.longitude ?? 0,
                }}
                radius={1000}
                strokeColor="rgba(255, 0, 0, 0.3)"
                fillColor="rgba(255, 0, 0, 0.1)"
                strokeWidth={1}
              />
            </React.Fragment>
          ))}

        {mode === 'events' &&
          events.map((event, index) => {
            if (!event.lat || !event.long) return null
            const iconName = getEventTypeIcon(event.post_type)
            const iconColor = getEventTypeColor(event.post_type)

            return (
              <Marker
                key={event.id ?? index}
                coordinate={{ latitude: event.lat, longitude: event.long }}
              >
                <View
                  style={[
                    styles.eventMarkerContainer,
                    { backgroundColor: iconColor },
                  ]}
                >
                  <Feather name={iconName} size={16} color="white" />
                </View>
                <Callout>
                  <TouchableOpacity
                    style={styles.calloutContainer}
                    activeOpacity={0.8}
                    onPress={() => setSelectedEvent(event)}
                  >
                    <Text style={styles.calloutTitle}>{event.title}</Text>
                    <Text style={styles.calloutSubtitle}>
                      {event.organizations?.name || ''}
                    </Text>
                    <Text style={styles.calloutSubtitle}>
                      {event.date || ''}
                    </Text>
                  </TouchableOpacity>
                </Callout>
              </Marker>
            )
          })}
      </MapView>

      {selectedEvent ? (
        <AnnouncementModal
          visible
          onClose={() => setSelectedEvent(null)}
          announcement={selectedEvent}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerIcon: { width: 30, height: 30 },
  androidMarkerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  androidMarkerCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  androidMarkerCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  androidMapCardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  androidMapCard: {
    minWidth: 180,
    maxWidth: 240,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  androidMapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  androidMapCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4732',
    marginRight: 8,
  },
  androidMapCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  androidMapCardLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F855A',
  },
  androidEventGroupCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  androidEventGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  androidEventGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  androidEventGroupTitle: {
    flex: 1,
    fontSize: 13,
    color: '#1D4732',
    fontWeight: '500',
    marginRight: 8,
  },
  eventMarkerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#da3d3dff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  calloutContainer: {
    minWidth: 120,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2D6A4F',
    marginBottom: 2,
    textAlign: 'center',
  },
  calloutSubtitle: { fontSize: 10, color: '#52796F', textAlign: 'center' },
})

export default DetailedMap
