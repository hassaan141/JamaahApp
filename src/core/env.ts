const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (__DEV__) {
  if (!SUPABASE_URL) {
    console.warn('EXPO_PUBLIC_SUPABASE_URL is missing. Add it to your .env')
  }
  if (!SUPABASE_ANON_KEY) {
    console.warn(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Add it to your .env',
    )
  }
}

export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} as const
