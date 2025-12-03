import { supabase } from './supabaseClient'
import messaging from '@react-native-firebase/messaging'
import { Platform } from 'react-native'

export async function registerDeviceToken(profileId: string) {
  try {
    // Request permission first
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      console.log('Push notifications not authorized')
      return null
    }

    // Get FCM token
    const fcmToken = await messaging().getToken()
    if (!fcmToken) {
      console.log('No FCM token available')
      return null
    }
    // Store in database (upsert to handle token refresh)
    const { error } = await supabase.from('devices').upsert(
      {
        profile_id: profileId,
        platform: Platform.OS,
        fcm_token: fcmToken,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'fcm_token',
      },
    )

    if (error) {
      console.error('Error registering device:', error)
      return null
    }

    console.log('Device registered successfully')
    return fcmToken
  } catch (error) {
    console.error('Error in registerDeviceToken:', error)
    return null
  }
}

export async function updateDeviceLastSeen(profileId: string) {
  try {
    const { error } = await supabase
      .from('devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('profile_id', profileId)

    if (error) {
      console.error('Error updating device last seen:', error)
    }
  } catch (error) {
    console.error('Error in updateDeviceLastSeen:', error)
  }
}
