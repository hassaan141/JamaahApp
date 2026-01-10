import { useEffect, useState, useRef } from 'react' // Added useRef
import { AppState } from 'react-native' // Added AppState
import * as Location from 'expo-location'
import type { LocationObject, LocationSubscription } from 'expo-location'
import { resolveOrgForTimes } from './organizationResolver'
import { supabase } from '@/Supabase/supabaseClient'

const ORG_UPDATE_THRESHOLD = 500 // meters - update org if moved >500m

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

  // NEW: Track last org update location to avoid frequent updates
  const lastOrgUpdateLocation = useRef<{ lat: number; lon: number } | null>(
    null,
  )

  useEffect(() => {
    let subscription: LocationSubscription | null = null
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission denied')
        setIsLocationReady(true) // Unblock even if error
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 100, // Update UI on any 100m movement
        },
        async (loc: LocationObject) => {
          const newLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }
          setLocation(newLocation)
          setIsLocationReady(true)

          // NEW: Check if user moved >500m for org update
          if (lastOrgUpdateLocation.current) {
            const distance = haversineDistance(
              lastOrgUpdateLocation.current.lat,
              lastOrgUpdateLocation.current.lon,
              newLocation.latitude,
              newLocation.longitude,
            )

            if (distance > ORG_UPDATE_THRESHOLD) {
              console.log(
                `[Location] Moved ${distance.toFixed(0)}m, updating org...`,
              )
              try {
                await resolveOrgForTimes(user.id, undefined, {
                  lat: newLocation.latitude,
                  lon: newLocation.longitude,
                })
                lastOrgUpdateLocation.current = {
                  lat: newLocation.latitude,
                  lon: newLocation.longitude,
                }
              } catch (e) {
                console.error('[Location] Org update failed:', e)
              }
            }
          } else {
            // First location - initialize the ref
            lastOrgUpdateLocation.current = {
              lat: newLocation.latitude,
              lon: newLocation.longitude,
            }
          }
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

            // NEW: Force org update on app resume
            const {
              data: { user },
            } = await supabase.auth.getUser()

            if (user) {
              await resolveOrgForTimes(user.id, undefined, {
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
              })
              lastOrgUpdateLocation.current = {
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
              }
            }
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

// NEW: Haversine distance calculation (meters)
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
