import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Circle, Callout } from 'react-native-maps'
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
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

    const targets: { latitude: number; longitude: number }[] = [
      { latitude: location.latitude, longitude: location.longitude },
    ]

    if (mode === 'masjids') {
      nearbyMasjids.forEach((m) => {
        if (m.latitude && m.longitude) {
          targets.push({ latitude: m.latitude, longitude: m.longitude })
        }
      })
    } else {
      events.forEach((e) => {
        if (e.lat && e.long) {
          targets.push({ latitude: e.lat, longitude: e.long })
        }
      })
    }

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
                      {event.date || 'No date'}
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
  calloutSubtitle: { fontSize: 13, color: '#52796F', textAlign: 'center' },
})

export default DetailedMap
