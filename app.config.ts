import dotenv from 'dotenv'

// Load local .env for dev; noop if file missing
dotenv.config({ path: '.env' })

// 1. DETERMINE THE ENVIRONMENT
const isDev = process.env.EAS_BUILD_PROFILE === 'development'
const isPreview = process.env.EAS_BUILD_PROFILE === 'preview'

// 2. SELECT THE CORRECT ICON
const getIcon = () => {
  if (isDev) return './assets/jamahDev.png'
  if (isPreview) return './assets/jamahTest.png'
  return './assets/JamahProd.png' // Default / Production
}

// 3. GET DISPLAY NAME (What user sees on screen)
const getDisplayName = () => {
  if (isDev) return 'Jamaah (Dev)'
  if (isPreview) return 'Jamaah (Prev)'
  return 'JamaahApp'
}

export default () => ({
  expo: {
    // 👇 FIX: Keep this STABLE so the build doesn't break
    name: 'JamaahApp',
    slug: 'jamaahapp',

    // Link Dynamic Icon
    icon: getIcon(),

    plugins: [
      'expo-font',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],
    projectId: '18f59a83-4081-4b80-b61b-67fc127f5577',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      bundleIdentifier: 'com.hassaan141.jamaahapp',
      googleServicesFile: './GoogleService-Info.plist',
      supportsTablet: true,
      entitlements: {
        'aps-environment': isDev ? 'development' : 'production',
      },
      infoPlist: {
        // 👇 NEW: Change the visible name here instead!
        CFBundleDisplayName: getDisplayName(),
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to find nearby masjids and show accurate prayer times.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      package: 'com.hassaan141.jamaahapp',
      googleServicesFile: './google-services.json',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],

      adaptiveIcon: {
        foregroundImage: getIcon(),
        backgroundColor: '#ffffff',
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL:
        process.env.EXPO_PUBLIC_SUPABASE_URL ?? '${EXPO_PUBLIC_SUPABASE_URL}',
      EXPO_PUBLIC_SUPABASE_ANON_KEY:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        '${EXPO_PUBLIC_SUPABASE_ANON_KEY}',
      EXPO_PUBLIC_TESTING_MODE:
        process.env.EXPO_PUBLIC_TESTING_MODE ?? '${EXPO_PUBLIC_TESTING_MODE}',
      EXPO_PUBLIC_TEST_EMAIL:
        process.env.EXPO_PUBLIC_TEST_EMAIL ?? '${EXPO_PUBLIC_TEST_EMAIL}',
      EXPO_PUBLIC_TEST_PASSWORD:
        process.env.EXPO_PUBLIC_TEST_PASSWORD ?? '${EXPO_PUBLIC_TEST_PASSWORD}',
      EXPO_PUBLIC_API_URL:
        process.env.EXPO_PUBLIC_API_URL ?? '${EXPO_PUBLIC_API_URL}',
      eas: {
        projectId: '18f59a83-4081-4b80-b61b-67fc127f5577',
      },
    },
  },
})
