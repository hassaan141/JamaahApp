import { registerDeviceToken } from '@/Supabase/registerDevice'
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import type * as Messaging from '@react-native-firebase/messaging'

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private initialized = false
  private currentUserId: string | null = null
  private messagingModule: typeof Messaging | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  private async getMessagingModule() {
    if (!this.messagingModule) {
      try {
        this.messagingModule = await import('@react-native-firebase/messaging')
        return this.messagingModule
      } catch (error) {
        console.error('React Native Firebase not available:', error)
        return null
      }
    }
    return this.messagingModule
  }

  async initialize(userId: string) {
    if (this.initialized && this.currentUserId === userId) return

    try {
      const module = await this.getMessagingModule()
      if (!module) {
        console.warn(
          'Firebase messaging not available, skipping push notification setup',
        )
        return
      }

      const {
        getMessaging,
        onTokenRefresh,
        onMessage,
        setBackgroundMessageHandler,
      } = module
      const messaging = getMessaging()

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

      onTokenRefresh(messaging, async (token: string) => {
        console.log('FCM Token refreshed:', token)
        if (this.currentUserId) {
          await registerDeviceToken(this.currentUserId)
        }
      })

      if (!this.initialized) {
        onMessage(
          messaging,
          async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('Foreground message:', remoteMessage)
          },
        )

        setBackgroundMessageHandler(
          messaging,
          async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('Background message:', remoteMessage)
          },
        )
      }

      this.initialized = true
      console.log('Push notifications initialized for user:', userId)
    } catch (error) {
      console.error('Error initializing push notifications:', error)
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const module = await this.getMessagingModule()
      if (!module) return false

      const { getMessaging, requestPermission, AuthorizationStatus } = module
      const messaging = getMessaging()

      const authStatus = await requestPermission(messaging)
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      )
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const module = await this.getMessagingModule()
      if (!module) return null

      const { getMessaging, getToken } = module
      const messaging = getMessaging()

      return await getToken(messaging)
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }
}
