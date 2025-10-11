import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import type { LocationObject, LocationSubscription } from 'expo-location'

export async function getCoarseLocation(): Promise<{
  latitude: number
  longitude: number
}> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') throw new Error('location-denied')
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
}

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: LocationSubscription | null = null
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission denied')
        return
      }
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 100,
        },
        (loc: LocationObject) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          })
        },
      )
    }
    startWatching()
    return () => {
      subscription?.remove()
    }
  }, [])

  return { location, error }
}
