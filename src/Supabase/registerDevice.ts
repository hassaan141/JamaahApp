import { supabase } from './supabaseClient'
import { Platform } from 'react-native'

async function getMessagingModule() {
  try {
    return await import('@react-native-firebase/messaging')
  } catch (error) {
    console.error('React Native Firebase not available:', error)
    return null
  }
}

export async function registerDeviceToken(
  profileId: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  console.log('[registerDeviceToken] Starting for profile:', profileId)
  try {
    const messagingModule = await getMessagingModule()
    if (!messagingModule) {
      console.warn('[registerDeviceToken] Firebase messaging not available')
      return {
        success: false,
        error: 'Firebase messaging not available (native module missing)',
      }
    }

    const {
      getMessaging,
      requestPermission,
      getToken,
      registerDeviceForRemoteMessages,
      AuthorizationStatus,
    } = messagingModule
    const messaging = getMessaging()

    // Request permission first
    const authStatus = await requestPermission(messaging)
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL

    console.log('[registerDeviceToken] Authorization status:', authStatus)

    if (!enabled) {
      console.log('[registerDeviceToken] Push notifications not authorized')
      return { success: false, error: 'Push notifications not authorized' }
    }

    if (Platform.OS === 'ios') {
      console.log(
        '[registerDeviceToken] Registering for remote messages (iOS)...',
      )
      await registerDeviceForRemoteMessages(messaging)
    }

    let fcmToken
    try {
      fcmToken = await getToken(messaging)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      console.error('[registerDeviceToken] Failed to get FCM token:', e)
      return {
        success: false,
        error: `Failed to get FCM token: ${errorMessage}`,
      }
    }

    if (!fcmToken) {
      console.log('[registerDeviceToken] No FCM token returned')
      return { success: false, error: 'No FCM token returned' }
    }

    console.log('[registerDeviceToken] Got FCM token:', fcmToken)

    const { error } = await supabase.rpc('register_device_token', {
      p_fcm_token: fcmToken,
      p_platform: Platform.OS,
    })

    if (error) {
      console.error('[registerDeviceToken] DB Error:', error)
      return { success: false, error: `DB Error: ${error.message}` }
    }

    console.log('[registerDeviceToken] Success! Device registered via RPC')
    return { success: true, token: fcmToken }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[registerDeviceToken] Unexpected error:', error)
    return { success: false, error: `Unexpected error: ${errorMessage}` }
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
