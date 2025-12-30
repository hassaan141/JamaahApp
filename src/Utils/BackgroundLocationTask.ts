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

TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: LocationTaskPayload) => {
    if (error) {
      const isLocationUnknownError = error.message.includes(
        'kCLErrorDomain Code=0',
      )

      if (isLocationUnknownError) {
        console.log(
          '[Background] Task: Could not determine location at this time. Will try again on the next run.',
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

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
          return
        }

        // FIX: Pass 'undefined' for the dateStr (2nd arg) so it defaults to Today
        // The location object is now the 3rd argument.
        await resolveOrgForTimes(user.id, undefined, {
          lat: latestLocation.coords.latitude,
          lon: latestLocation.coords.longitude,
        })
      } catch (err) {
        console.error('[Background] Failed to resolve org:', err)
      }
    }
  },
)

export const startBackgroundTracking = async () => {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync()

    if (status === 'granted') {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 1000,
        deferredUpdatesInterval: 60 * 1000,
        showsBackgroundLocationIndicator: false,
        foregroundService: {
          notificationTitle: 'Prayer Times Auto-Update',
          notificationBody: 'Checking closest masjid location...',
        },
      })
    }
  } catch (e) {
    console.error('[Background] Start Error:', e)
  }
}

export const stopBackgroundTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK,
    )
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    }
  } catch (e) {
    console.error('[Background] Stop Error:', e)
  }
}
