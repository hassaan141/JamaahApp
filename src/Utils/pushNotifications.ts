import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'
import { Platform, PermissionsAndroid } from 'react-native'
import { registerDeviceToken } from '@/Supabase/registerDevice'
import { toast } from '@/components/Toast/toast'

const STORAGE_KEY_TOPIC = 'current_prayer_topic'

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private initialized = false
  private currentUserId: string | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  private async requestAndroidPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true
    if (Platform.Version < 33) return true

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (error) {
      console.error('Error requesting Android notification permission:', error)
      return false
    }
  }

  async initialize(userId: string) {
    if (this.initialized && this.currentUserId === userId) return

    try {
      const hasPermission = await this.requestAndroidPermission()
      if (!hasPermission) {
        console.warn(
          '[PushNotificationManager] Android notification permission denied',
        )
      }

      this.currentUserId = userId
      console.log(
        '[PushNotificationManager] Registering token for user:',
        userId,
      )

      const result = await registerDeviceToken(userId)
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
        console.log('[PushNotificationManager] Resubscribing on init:', topic)
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
      console.log('Push notifications initialized for user:', userId)
    } catch (error) {
      console.error('Error initializing push notifications:', error)
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
