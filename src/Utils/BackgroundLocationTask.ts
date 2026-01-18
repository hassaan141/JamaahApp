import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { supabase } from '@/Supabase/supabaseClient'
import { resolveOrgForTimes } from '@/Utils/organizationResolver'

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_PRAYER_UPDATES'

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
        await resolveOrgForTimes(user.id, undefined, {
          lat: latestLocation.coords.latitude,
          lon: latestLocation.coords.longitude,
        })

        console.log('[Background] Org resolved successfully')
      } catch (err) {
        console.error('[Background] Failed to resolve org:', err)
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
