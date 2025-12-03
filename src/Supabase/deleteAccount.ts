import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

export async function deleteAccount() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return { ok: false, error: 'User not authenticated' }
    }

    // Hard delete the user's profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) {
      console.error('[deleteAccount] Database error:', error)
      return { ok: false, error: error.message }
    }

    // Sign out the user
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
