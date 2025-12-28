import { useEffect, useState, useRef } from 'react' // Added useRef
import { AppState } from 'react-native' // Added AppState
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

  // NEW: Track if we have finished the initial load
  const [isLocationReady, setIsLocationReady] = useState(false)

  // NEW: Track AppState to detect when user "Resumes" the app
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    let subscription: LocationSubscription | null = null
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission denied')
        setIsLocationReady(true) // Unblock even if error
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
          setIsLocationReady(true)
        },
      )
    }
    startWatching()
    return () => {
      subscription?.remove()
    }
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log(
            '⚡️ App returned to foreground! Forcing location check...',
          )
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            })
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            })
          } catch (e) {
            console.log('Failed to force update on resume:', e)
          }
        }
        appState.current = nextAppState
      },
    )

    return () => {
      subscription.remove()
    }
  }, [])

  return { location, error, isLocationReady }
}
