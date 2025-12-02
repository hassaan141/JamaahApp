import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Circle, Callout } from 'react-native-maps'
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LeafletView } from 'react-native-leaflet-view'
import Feather from '@expo/vector-icons/Feather'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { fetchAnnouncements } from '@/Supabase/fetchAllAnnouncements'
import { useLocation } from '@/Utils/useLocation'
import LoadingAnimation from '@/components/Loading/Loading'
import mosqueIcon from '../../../assets/mosque.png'
import type { MasjidItem } from '@/Hooks/useMasjidList'
import type { OrgPost } from '@/types'

const getEventTypeIcon = (
  postType: string | null,
): React.ComponentProps<typeof Feather>['name'] => {
  switch (postType) {
    case 'Event':
      return 'calendar'
    case 'Repeating_classes':
      return 'book-open'
    case 'Janazah':
      return 'heart'
    case 'Volunteerng':
    case 'Volunteering':
      return 'users'
    default:
      return 'calendar'
  }
}

const getEventTypeColor = (postType: string | null) => {
  switch (postType) {
    case 'Event':
      return '#2F855A'
    case 'Repeating_classes':
      return '#3182CE'
    case 'Janazah':
      return '#E53E3E'
    case 'Volunteerng':
    case 'Volunteering':
      return '#805AD5'
    default:
      return '#2F855A'
  }
}

const getFeatherIconSVG = (iconName: string) => {
  switch (iconName) {
    case 'calendar':
      return '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
    case 'book-open':
      return '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>'
    case 'heart':
      return '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'
    case 'users':
      return '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
    default:
      return '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
  }
}

const DetailedMap: React.FC<{ mode?: 'masjids' | 'events' }> = ({
  mode = 'masjids',
}) => {
  const navigation = useNavigation() as unknown as {
    navigate?: (route: string, params?: Record<string, unknown>) => void
  }
  const { location } = useLocation()
  const [nearbyMasjids, setNearbyMasjids] = useState<MasjidItem[]>([])
  const [events, setEvents] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!location) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        setError(null)
        if (mode === 'masjids') {
          const ten_masjid_list = await fetchNearbyMasjids(
            location.latitude,
            location.longitude,
          )
          setNearbyMasjids(ten_masjid_list as MasjidItem[])
        } else {
          const posts = await fetchAnnouncements()
          setEvents(posts)
        }
        setLoading(false)
      } catch (err: unknown) {
        console.error('Error loading map data:', err)
        setError((err as Error)?.message ?? 'Failed to load data')
        setLoading(false)
      }
    }
    loadData()
  }, [location, mode])

  useEffect(() => {
    if (!mapRef.current || !location) return

    const userCoord = {
      latitude: location.latitude,
      longitude: location.longitude,
    }

    const distanceSq = (
      a: { latitude: number; longitude: number },
      b: { latitude: number; longitude: number },
    ) => {
      const dLat = a.latitude - b.latitude
      const dLon = a.longitude - b.longitude
      return dLat * dLat + dLon * dLon
    }

    // collect marker coordinates, sort by proximity to user, take up to 3 nearest
    const markerCoords: { latitude: number; longitude: number }[] =
      mode === 'masjids'
        ? nearbyMasjids
            .filter((m) => m.latitude != null && m.longitude != null)
            .map((m) => ({
              latitude: m.latitude as number,
              longitude: m.longitude as number,
            }))
        : events
            .filter((e) => e.lat != null && e.long != null)
            .map((e) => ({
              latitude: e.lat as number,
              longitude: e.long as number,
            }))

    const nearest = markerCoords
      .slice()
      .sort((a, b) => distanceSq(a, userCoord) - distanceSq(b, userCoord))
      .slice(0, 3)

    const targets = [userCoord, ...nearest]

    if (targets.length > 1) {
      mapRef.current.fitToCoordinates(targets, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      })
    }
  }, [nearbyMasjids, events, mode, location])

  if (loading || !location) {
    return <LoadingAnimation />
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    )
  }

  // Android: Use react-native-leaflet-view, iOS: Use existing MapView
  if (Platform.OS === 'android') {
    const mapLayers = [
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        baseLayerIsChecked: true,
        baseLayerName: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      },
    ]

    // Convert React Native Image.resolveAssetSource to get the actual URI
    const mosqueIconUri = Image.resolveAssetSource(mosqueIcon).uri

    const markers = [
      // User location marker - use a blue dot similar to iOS
      {
        id: 'user-location',
        position: { lat: location.latitude, lng: location.longitude },
        icon: `<div style="width: 20px; height: 20px; background: #007AFF; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        size: { x: 20, y: 20 },
        iconAnchor: { x: 10, y: 10 },
      },
      // Add other markers based on mode
      ...(mode === 'masjids'
        ? nearbyMasjids
            .filter((m) => m.latitude && m.longitude)
            .map((m, index) => ({
              id: `masjid-${index}`,
              position: { lat: m.latitude!, lng: m.longitude! },
              icon: `<img src="${mosqueIconUri}" style="width: 30px; height: 30px;" />`,
              size: { x: 30, y: 30 },
              iconAnchor: { x: 15, y: 15 },
              title: m.name,
            }))
        : events
            .filter((e) => e.lat && e.long)
            .map((e, index) => {
              const iconName = getEventTypeIcon(e.post_type)
              const iconColor = getEventTypeColor(e.post_type)

              // Create SVG icon similar to iOS Feather icons
              const svgIcon = `
                <div style="
                  width: 30px; 
                  height: 30px; 
                  background: ${iconColor}; 
                  border-radius: 15px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24" stroke="white" stroke-width="2">
                    ${getFeatherIconSVG(iconName)}
                  </svg>
                </div>
              `

              return {
                id: `event-${index}`,
                position: { lat: e.lat!, lng: e.long! },
                icon: svgIcon,
                size: { x: 30, y: 30 },
                iconAnchor: { x: 15, y: 15 },
                title: e.title,
              }
            })),
    ]

    return (
      <View style={styles.container}>
        <LeafletView
          mapLayers={mapLayers}
          mapMarkers={markers}
          mapCenterPosition={{
            lat: location.latitude,
            lng: location.longitude,
          }}
          zoom={13}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          pinColor="blue"
        />

        {mode === 'masjids' &&
          nearbyMasjids.map((marker, index) => (
            <React.Fragment key={marker.id ?? index}>
              <Marker
                coordinate={{
                  latitude: marker.latitude ?? 0,
                  longitude: marker.longitude ?? 0,
                }}
              >
                <Image source={mosqueIcon} style={styles.markerIcon} />
                <Callout>
                  <TouchableOpacity
                    onPress={() => {
                      // navigation typed as any to avoid TS navigation type complexity here
                      // navigate to OrganizationDetail with org data
                      if (
                        navigation &&
                        typeof navigation.navigate === 'function'
                      ) {
                        navigation.navigate('OrganizationDetail', {
                          org: marker,
                        })
                      } else {
                        console.warn(
                          'Navigation prop not available. Cannot navigate to OrganizationDetail.',
                        )
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
                coordinate={{
                  latitude: event.lat,
                  longitude: event.long,
                }}
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
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{event.title}</Text>
                    <Text style={styles.calloutSubtitle}>
                      {event.organizations?.name || ''}
                    </Text>
                    <Text style={styles.calloutSubtitle}>
                      {event.date || ''}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            )
          })}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerIcon: { width: 30, height: 30 },
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
