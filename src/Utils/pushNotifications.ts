import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'
import { PermissionsAndroid, Platform } from 'react-native'
import { registerDeviceToken } from '@/Supabase/registerDevice'
import { toast } from '@/components/Toast/toast'

const STORAGE_KEY_TOPIC = 'current_prayer_topic'
const STORAGE_KEY_PERMISSION_ASKED = 'notification_permission_asked'

/**
 * Request notification permission on app start (before sign-in).
 * This is the standard pattern for production apps.
 * Only prompts once - tracks if we've already asked.
 */
export async function requestNotificationPermissionOnStart(): Promise<boolean> {
  try {
    // Check if we've already asked
    const alreadyAsked = await AsyncStorage.getItem(
      STORAGE_KEY_PERMISSION_ASKED,
    )
    if (alreadyAsked === 'true') {
      console.log('[Notifications] Permission already requested previously')
      return true
    }

    let granted = false

    // Android 13+ needs runtime permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      granted = result === PermissionsAndroid.RESULTS.GRANTED
      console.log('[Notifications] Android permission result:', result)
    }

    // iOS (and fallback) - use Firebase's requestPermission
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      console.log('[Notifications] iOS permission status:', authStatus)
    }

    // Mark as asked so we don't prompt again
    await AsyncStorage.setItem(STORAGE_KEY_PERMISSION_ASKED, 'true')

    return granted
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error)
    return false
  }
}

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private initialized = false
  private currentUserId: string | null = null
  private initInFlight: Promise<void> | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  private async checkAndroidPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true
    if (Platform.Version < 33) return true

    try {
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      return status
    } catch (error) {
      console.error('[PushNotificationManager] Permission check error:', error)
      return false
    }
  }

  async initialize(userId: string) {
    if (this.initialized && this.currentUserId === userId) return

    this.currentUserId = userId
    const initUserId = userId

    if (!this.initInFlight) {
      this.initInFlight = (async () => {
        try {
          // Permission should already be requested on app start
          const hasPermission = await this.checkAndroidPermission()
          if (!hasPermission) {
            console.warn(
              '[PushNotificationManager] Android notification permission not granted',
            )
          }

          console.log(
            '[PushNotificationManager] Registering token for user:',
            initUserId,
          )

          const result = await registerDeviceToken(initUserId)
          if (!result.success) {
            console.warn(
              '[PushNotificationManager] Registration failed:',
              result.error,
            )
          }

          messaging().onTokenRefresh(async (token) => {
            console.log('FCM Token refreshed:', token)
            if (this.currentUserId) {
              await registerDeviceToken(this.currentUserId)
              // Force resubscribe on token refresh (iOS loses subscriptions)
              const currentTopic = await AsyncStorage.getItem(STORAGE_KEY_TOPIC)
              if (currentTopic) {
                const topic = `org_${currentTopic}_prayers`
                console.log(
                  '[PushNotificationManager] Resubscribing after token refresh:',
                  topic,
                )
                await messaging().subscribeToTopic(topic)
              }
            }
          })

          // Resubscribe to current topic on init (handles iOS cold start)
          const currentTopic = await AsyncStorage.getItem(STORAGE_KEY_TOPIC)
          if (currentTopic) {
            const topic = `org_${currentTopic}_prayers`
            console.log(
              '[PushNotificationManager] Resubscribing on init:',
              topic,
            )
            await messaging().subscribeToTopic(topic)
          }

          if (!this.initialized) {
            messaging().onMessage(async (remoteMessage) => {
              console.log('[Foreground Message]', remoteMessage)
              const title = remoteMessage.notification?.title || 'Notification'
              const body = remoteMessage.notification?.body || ''
              toast.info(body, title)
            })

            messaging().setBackgroundMessageHandler(async (remoteMessage) => {
              console.log('[Background Message]', remoteMessage)
            })
          }

          this.initialized = true
          console.log('Push notifications initialized for user:', initUserId)
        } catch (error) {
          console.error('Error initializing push notifications:', error)
        }
      })().finally(() => {
        this.initInFlight = null
      })
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission()
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      )
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await messaging().getToken()
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }
}

export async function syncPrayerSubscription(targetOrgId: string | null) {
  try {
    const currentSubscribedOrg = await AsyncStorage.getItem(STORAGE_KEY_TOPIC)

    if (currentSubscribedOrg === targetOrgId) {
      return
    }

    console.log(
      `[PrayerSub] Switching: ${currentSubscribedOrg} -> ${targetOrgId}`,
    )

    if (currentSubscribedOrg) {
      const oldTopic = `org_${currentSubscribedOrg}_prayers`
      await messaging().unsubscribeFromTopic(oldTopic)
    }

    if (targetOrgId) {
      const newTopic = `org_${targetOrgId}_prayers`
      await messaging().subscribeToTopic(newTopic)
      await AsyncStorage.setItem(STORAGE_KEY_TOPIC, targetOrgId)
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_TOPIC)
    }
  } catch (error) {
    console.error('[PrayerSub] Failed to sync topic:', error)
  }
}
