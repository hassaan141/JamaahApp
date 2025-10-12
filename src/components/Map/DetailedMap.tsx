import React, { useState, useEffect } from 'react'
import MapView, { Marker, Circle, Callout } from 'react-native-maps'
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { fetchNearbyMasjids } from '@/Supabase/fetchMasjidList'
import { useLocation } from '@/Utils/useLocation'
import LoadingAnimation from '@/components/Loading/Loading'
import mosqueIcon from '../../../assets/mosque.png'
import type { MasjidItem } from '@/Hooks/useMasjidList'

const DetailedMap: React.FC = () => {
  const navigation = useNavigation() as unknown as {
    navigate?: (route: string, params?: Record<string, unknown>) => void
  }
  const { location } = useLocation()
  const [nearbyMasjids, setNearbyMasjids] = useState<MasjidItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMasid = async () => {
      if (!location) {
        setLoading(false)
        return
      }
      try {
        setError(null)
        const ten_masjid_list = await fetchNearbyMasjids(
          location.latitude,
          location.longitude,
        )
        setNearbyMasjids(ten_masjid_list as MasjidItem[])
        setLoading(false)
      } catch (err: unknown) {
        console.error('Error loading masjids:', err)
        setError((err as Error)?.message ?? 'Failed to load masjids')
        setLoading(false)
      }
    }
    loadMasid()
  }, [location])

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
          description="You are here"
          pinColor="blue"
        />

        {nearbyMasjids.map((marker, index) => (
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
                      navigation.navigate('OrganizationDetail', { org: marker })
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
                  <Text style={styles.calloutSubtitle}>Tap for details</Text>
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
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerIcon: { width: 30, height: 30 },
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
