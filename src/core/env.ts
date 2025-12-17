import Constants from 'expo-constants'

const extras = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>

const normalizeExtra = (val?: unknown) => {
  if (typeof val !== 'string') return undefined
  if (val.startsWith('${') && val.endsWith('}')) return undefined
  return val
}

const SUPABASE_URL =
  (normalizeExtra(extras.EXPO_PUBLIC_SUPABASE_URL) as string | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  ''
const SUPABASE_ANON_KEY =
  (normalizeExtra(extras.EXPO_PUBLIC_SUPABASE_ANON_KEY) as
    | string
    | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  ''

// Dev-only testing flags. Do not enable or set credentials in production.
const TESTING_MODE_RAW =
  extras.EXPO_PUBLIC_TESTING_MODE ?? process.env.EXPO_PUBLIC_TESTING_MODE ?? ''
const TEST_EMAIL =
  extras.EXPO_PUBLIC_TEST_EMAIL ?? process.env.EXPO_PUBLIC_TEST_EMAIL ?? ''
const TEST_PASSWORD =
  extras.EXPO_PUBLIC_TEST_PASSWORD ??
  process.env.EXPO_PUBLIC_TEST_PASSWORD ??
  ''
const TESTING_MODE =
  __DEV__ && (TESTING_MODE_RAW === '1' || TESTING_MODE_RAW === 'true')

if (__DEV__) {
  if (!SUPABASE_URL) {
    console.warn('EXPO_PUBLIC_SUPABASE_URL is missing. Add it to your .env')
  }
  if (!SUPABASE_ANON_KEY) {
    console.warn(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Add it to your .env',
    )
  }
  if (TESTING_MODE) {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      console.warn(
        'Testing mode is enabled but TEST_EMAIL/TEST_PASSWORD are missing',
      )
    }
  }
}

export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TESTING: {
    enabled: TESTING_MODE,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  },
} as const
