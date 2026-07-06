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
      return {
        success: false,
        error: 'Firebase messaging not available',
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

    const authStatus = await requestPermission(messaging)
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      return { success: false, error: 'Push notifications not authorized' }
    }

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging)
    }

    let fcmToken
    try {
      fcmToken = await getToken(messaging)
    } catch (e) {
      return {
        success: false,
        error: `Failed to get FCM token: ${e instanceof Error ? e.message : 'Unknown'}`,
      }
    }

    if (!fcmToken) {
      return { success: false, error: 'No FCM token returned' }
    }

    const { error: rpcError } = await supabase.rpc('register_device_token', {
      p_fcm_token: fcmToken,
      p_platform: Platform.OS,
    })

    if (rpcError) {
      console.error('[registerDeviceToken] RPC failed:', rpcError)
      return { success: false, error: rpcError.message }
    }

    console.log('[registerDeviceToken] Success via RPC')
    return { success: true, token: fcmToken }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[registerDeviceToken] Unexpected error:', error)
    return { success: false, error: errorMessage }
  }
}

export async function cleanupInvalidToken(profileId: string, fcmToken: string) {
  try {
    const { error } = await supabase.rpc('cleanup_invalid_fcm_token', {
      p_profile_id: profileId,
      p_fcm_token: fcmToken,
    })

    if (error) {
      console.error('[cleanupInvalidToken] RPC failed:', error)
    }
  } catch (error) {
    console.error('Error in cleanupInvalidToken:', error)
  }
}
