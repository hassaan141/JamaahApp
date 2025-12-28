import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'
import { syncPrayerSubscription } from '@/Utils/pushNotifications'
import messaging from '@react-native-firebase/messaging'

export async function deleteAccount() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return { ok: false, error: 'User not authenticated' }
    }

    console.log('[deleteAccount] Starting cleanup...')

    // 1. Unsubscribe from current prayer topic
    await syncPrayerSubscription(null)

    // 2. Remove the Device Token from DB
    try {
      const token = await messaging().getToken()
      if (token) {
        await supabase.from('devices').delete().eq('fcm_token', token)
      }
    } catch (e) {
      console.warn('[deleteAccount] Failed to cleanup token:', e)
    }

    // 3. SECURE DELETION: Call the Postgres RPC
    // This removes the user from 'auth.users'
    const { error: rpcError } = await supabase.rpc('delete_user_account')

    if (rpcError) {
      console.error('[deleteAccount] RPC error:', rpcError)
      return { ok: false, error: rpcError.message }
    }

    // 4. Final Sign Out
    // This clears the local session and SecureStore tokens
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('[deleteAccount] Sign out error:', signOutError)
    }

    return { ok: true }
  } catch (err) {
    console.error('[deleteAccount] Unexpected error:', err)
    return { ok: false, error: 'Failed to delete account' }
  }
}
