import { supabase } from './supabaseClient'

/**
 * Ensure a profiles row exists for the given user id.
 * - Inserts { id } when missing. Other fields rely on DB defaults.
 * - Safe to call after sign-in/sign-up.
 * - Logs warnings instead of throwing to avoid disrupting auth flow.
 */
export async function ensureProfileExists(userId: string): Promise<void> {
  if (!userId) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[ensureProfileExists] select error', error)
      return
    }

    if (!data) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId })

      if (insertError) {
        console.warn('[ensureProfileExists] insert error', insertError)
      } else {
        console.debug('[ensureProfileExists] inserted profile for', userId)
      }
    }
  } catch (e) {
    console.warn('[ensureProfileExists] unexpected error', e)
  }
}
