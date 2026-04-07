import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/Supabase/supabaseClient'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_PRAYER_UPDATES'
const BACKGROUND_LOCATION_DISCLOSURE_KEY =
  '@jamaah_background_location_disclosure_accepted'

interface LocationTaskPayload {
  data?: {
    locations: Location.LocationObject[]
  }
  error?: {
    message: string
  } | null
}

// Task runs when OS delivers location updates (even when app is terminated)
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: LocationTaskPayload) => {
    if (error) {
      const isLocationUnknownError = error.message.includes(
        'kCLErrorDomain Code=0',
      )

      if (isLocationUnknownError) {
        console.log(
          '[Background] Could not determine location. Will retry on next update.',
        )
      } else {
        console.error('[Background] Task Error:', error)
      }
      return
    }

    if (data) {
      const { locations } = data
      const latestLocation = locations[0]

      if (!latestLocation) return

      console.log(
        '[Background] Location update received:',
        latestLocation.coords.latitude,
        latestLocation.coords.longitude,
      )

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log('[Background] No user, stopping tracking')
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
          return
        }

        // This updates nearest masjid + syncs FCM subscription
        // Retry once on failure
        let attempts = 0
        const maxAttempts = 2

        while (attempts < maxAttempts) {
          try {
            await resolveOrgForTimes(user.id, undefined, {
              lat: latestLocation.coords.latitude,
              lon: latestLocation.coords.longitude,
            })
            console.log('[Background] Org resolved successfully')
            break
          } catch (resolveErr) {
            attempts++
            if (attempts < maxAttempts) {
              console.log(
                '[Background] Resolve failed, retrying...',
                resolveErr,
              )
              await new Promise((r) => setTimeout(r, 1000)) // Wait 1 second before retry
            } else {
              console.error(
                '[Background] Failed to resolve org after retries:',
                resolveErr,
              )
            }
          }
        }
      } catch (err) {
        console.error('[Background] Failed to get user:', err)
      }
    }
  },
)

/**
 * Start background location tracking using significant location changes.
 * Uses cell/WiFi triangulation (not GPS) - battery efficient and Apple-approved.
 * Works when app is backgrounded or terminated.
 */
export const startBackgroundTracking = async () => {
  try {
    if (Platform.OS === 'android') {
      const disclosureAccepted = await AsyncStorage.getItem(
        BACKGROUND_LOCATION_DISCLOSURE_KEY,
      )
      if (disclosureAccepted !== 'true') {
        console.warn('[Background] Disclosure not accepted, skipping request')
        return
      }
    }

    const { status: fgStatus } =
      await Location.requestForegroundPermissionsAsync()
    if (fgStatus !== 'granted') {
      console.warn('[Background] Foreground permission denied')
      return
    }

    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync()
    if (bgStatus !== 'granted') {
      console.warn('[Background] Background permission denied')
      return
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK,
    )
    if (isRegistered) {
      console.log('[Background] Already tracking')
      return
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced, // Cell/WiFi, not GPS - battery efficient
      distanceInterval: 500, // Only trigger after 500m movement
      deferredUpdatesDistance: 500,
      pausesUpdatesAutomatically: true, // Let iOS pause when stationary
      activityType: Location.ActivityType.Other,
      showsBackgroundLocationIndicator: false,
    })

    console.log('[Background] Started location tracking')
  } catch (e) {
    console.error('[Background] Start Error:', e)
  }
}

export const hasAcceptedBackgroundLocationDisclosure = async () => {
  const value = await AsyncStorage.getItem(BACKGROUND_LOCATION_DISCLOSURE_KEY)
  return value === 'true'
}

export const acceptBackgroundLocationDisclosure = async () => {
  await AsyncStorage.setItem(BACKGROUND_LOCATION_DISCLOSURE_KEY, 'true')
}

/**
 * Stop background location tracking.
 * Call when user switches to pinned mode or logs out.
 */
export const stopBackgroundTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK,
    )
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
      console.log('[Background] Stopped tracking')
    }
  } catch (e) {
    console.error('[Background] Stop Error:', e)
  }
}
