import messaging from '@react-native-firebase/messaging'
import { registerDeviceToken } from '@/Supabase/registerDevice'

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private initialized = false

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  async initialize(userId: string) {
    if (this.initialized) return

    try {
      // Register device token
      await registerDeviceToken(userId)

      // Handle token refresh
      messaging().onTokenRefresh(async (token) => {
        console.log('FCM Token refreshed:', token)
        await registerDeviceToken(userId)
      })

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message:', remoteMessage)
        // You can show in-app notification here if needed
      })

      // Handle background/quit state messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage)
      })

      this.initialized = true
      console.log('Push notifications initialized')
    } catch (error) {
      console.error('Error initializing push notifications:', error)
    }
  }

  async checkPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission()
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    )
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
