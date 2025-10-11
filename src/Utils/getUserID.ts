import { supabase } from '../Supabase/supabaseClient'

export async function getUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('not-authenticated')
  return user.id
}
