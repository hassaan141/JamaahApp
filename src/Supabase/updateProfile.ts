import { supabase } from './supabaseClient'
import { getUserId } from '@/Utils/getUserID'

type ProfileUpdateData = {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  country?: string | null
}

export async function updateProfile(data: ProfileUpdateData) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return { ok: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('[updateProfile] Database error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error('[updateProfile] Unexpected error:', err)
    return { ok: false, error: 'Failed to update profile' }
  }
}
