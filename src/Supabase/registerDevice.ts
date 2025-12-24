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

    // 1. Try RPC First (Best for handling ownership transfer securely)
    const { error: rpcError } = await supabase.rpc('register_device_token', {
      p_fcm_token: fcmToken,
      p_platform: Platform.OS,
    })

    if (!rpcError) {
      console.log('[registerDeviceToken] Success via RPC')
      return { success: true, token: fcmToken }
    }

    console.warn(
      '[registerDeviceToken] RPC failed, trying upsert fallback:',
      rpcError.message,
    )

    // 2. Fallback: Standard Upsert (If RPC missing/fails)
    const { error: upsertError } = await supabase.from('devices').upsert(
      {
        profile_id: profileId,
        fcm_token: fcmToken,
        platform: Platform.OS || 'unknown',
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'fcm_token' },
    )

    if (upsertError) {
      console.error('[registerDeviceToken] Fallback failed:', upsertError)
      return { success: false, error: upsertError.message }
    }

    console.log('[registerDeviceToken] Success via Upsert')
    return { success: true, token: fcmToken }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[registerDeviceToken] Unexpected error:', error)
    return { success: false, error: errorMessage }
  }
}

export async function updateDeviceLastSeen(profileId: string) {
  try {
    const { error } = await supabase
      .from('devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('profile_id', profileId)

    if (error) console.error('Error updating last seen:', error)
  } catch (error) {
    console.error('Error in updateDeviceLastSeen:', error)
  }
}

export async function cleanupInvalidToken(profileId: string, fcmToken: string) {
  try {
    // Try RPC first
    const { error } = await supabase.rpc('cleanup_invalid_fcm_token', {
      p_profile_id: profileId,
      p_fcm_token: fcmToken,
    })

    // Fallback delete if RPC fails
    if (error) {
      await supabase.from('devices').delete().match({ fcm_token: fcmToken })
    }
  } catch (error) {
    console.error('Error in cleanupInvalidToken:', error)
  }
}
