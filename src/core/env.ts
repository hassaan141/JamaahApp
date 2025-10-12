const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Dev-only testing flags. Do not enable or set credentials in production.
const TESTING_MODE_RAW = process.env.EXPO_PUBLIC_TESTING_MODE ?? ''
const TEST_EMAIL = process.env.EXPO_PUBLIC_TEST_EMAIL ?? ''
const TEST_PASSWORD = process.env.EXPO_PUBLIC_TEST_PASSWORD ?? ''
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
  // Feature flags for development/testing. Do not enable in production.
  // legacy/compat flag
  TEST_PROGRAMS_SCREEN:
    __DEV__ &&
    (process.env.EXPO_PUBLIC_TEST_PROGRAMS_SCREEN === '1' ||
      process.env.EXPO_PUBLIC_TEST_PROGRAMS_SCREEN === 'true'),
  // user-requested single flag (editable via EXPO_PUBLIC_TESTING_PROGRAMS_SCREN)
  // NOTE: environment variable name chosen to match user request; set EXPO_PUBLIC_TESTING_PROGRAMS_SCREN=1 to enable in dev
  testing_Programs_scren:
    __DEV__ &&
    (process.env.EXPO_PUBLIC_TESTING_PROGRAMS_SCREN === '1' ||
      process.env.EXPO_PUBLIC_TESTING_PROGRAMS_SCREN === 'true'),
} as const
