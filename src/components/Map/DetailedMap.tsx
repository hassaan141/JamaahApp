import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Circle, Callout } from 'react-native-maps'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LeafletView } from 'react-native-leaflet-view'
import Feather from '@expo/vector-icons/Feather'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { fetchAnnouncements } from '@/Supabase/fetchAllAnnouncements'
import { useLocation } from '@/Utils/useLocation'
import LoadingAnimation from '@/components/Loading/Loading'
import mosqueIcon from '../../../assets/mosque_new.png'
import type { MasjidItem } from '@/Hooks/useMasjidList'
import type { OrgPost } from '@/types'

const ANDROID_MOSQUE_ICON_URL =
  'https://kjbutgbpddsadvnbgblg.supabase.co/storage/v1/object/public/masjidLogo/mosque_new.png'

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

  // Data States
  const [nearbyMasjids, setNearbyMasjids] = useState<MasjidItem[]>([])
  const [events, setEvents] = useState<OrgPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [initialRegion, setInitialRegion] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const mapRef = useRef<MapView>(null)
  const hasInitialZoomed = useRef(false)

  // --- Effects ---

  useEffect(() => {
    if (location && !initialRegion) {
      const start = { lat: location.latitude, lng: location.longitude }
      setInitialRegion(start)
    }
  }, [location])

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
          const initialList = await fetchNearbyMasjids(
            location.latitude,
            location.longitude,
          )
          setNearbyMasjids(initialList as MasjidItem[])
        } else {
          const posts = await fetchAnnouncements()
          setEvents(posts)
        }
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [location, mode])

  useEffect(() => {
    if (!mapRef.current || !location || hasInitialZoomed.current) return

    const dataToCheck = mode === 'masjids' ? nearbyMasjids : events
    if (dataToCheck.length === 0) return

    hasInitialZoomed.current = true
  }, [nearbyMasjids, events, mode, location])

  // --- Render Preparation ---

  const mapLayers = React.useMemo(
    () => [
      {
        attribution: '&copy; OpenStreetMap contributors',
        baseLayerIsChecked: true,
        baseLayerName: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      },
    ],
    [],
  )

  const markers = React.useMemo(() => {
    if (Platform.OS !== 'android') return []

    // For Android WebView, we use HTML markers.
    // We use the HOSTED URL for the image to ensure it loads on all devices.
    const userLocationIcon = `
      <div style="width: 20px; height: 20px; background: #007AFF; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    `

    return [
      {
        id: 'user-location',
        position: {
          lat: location?.latitude ?? 0,
          lng: location?.longitude ?? 0,
        },
        icon: userLocationIcon,
        size: [24, 24],
        iconAnchor: [12, 12],
      },
      ...(mode === 'masjids'
        ? nearbyMasjids
            .filter((m) => m.latitude && m.longitude)
            .map((m, index) => {
              // CHANGE: We use an <img> tag with the hosted URL.
              // This bypasses the local file path security issues on A34 etc.
              const masjidIconHTML = `
                <div style="
                  width: 32px; 
                  height: 32px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                ">
                  <img 
                    src="${ANDROID_MOSQUE_ICON_URL}" 
                    style="width: 100%; height: 100%; object-fit: contain;" 
                    alt="Masjid"
                  />
                </div>
              `

              return {
                id: `masjid-${index}`,
                position: { lat: m.latitude!, lng: m.longitude! },
                icon: masjidIconHTML,
                size: [32, 32],
                iconAnchor: [16, 16],
                title: m.name,
              }
            })
        : events
            .filter((e) => e.lat && e.long)
            .map((e, index) => {
              const iconName = getEventTypeIcon(e.post_type)
              const iconColor = getEventTypeColor(e.post_type)

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
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      ${getFeatherIconSVG(iconName)}
                    </svg>
                  </div>
                `

              return {
                id: `event-${index}`,
                position: { lat: e.lat!, lng: e.long! },
                icon: svgIcon,
                size: [30, 30],
                iconAnchor: [15, 15],
                title: e.title,
              }
            })),
    ]
  }, [mode, nearbyMasjids, events, location])

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

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <LeafletView
          mapLayers={mapLayers}
          mapMarkers={markers}
          mapCenterPosition={
            initialRegion || { lat: location.latitude, lng: location.longitude }
          }
          zoom={13}
        />
      </View>
    )
  }

  // iOS (Platform.OS !== 'android') Logic
  // This continues to use the local asset directly via React Native Maps, which works fine.
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
                tracksViewChanges={false}
              >
                {/* iOS / Google Maps: We can use the Image component directly here 
                   because we are not inside a WebView.
                */}
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
