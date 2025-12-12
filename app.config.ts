import dotenv from 'dotenv'

// Load local .env for dev; noop if file missing
dotenv.config({ path: '.env' })

// 1. DETERMINE THE ENVIRONMENT
const isDev = process.env.EAS_BUILD_PROFILE === 'development'

// 2. SELECT THE CORRECT ICON
const getIcon = () => {
  if (isDev) return './assets/jamahDev.png' // Make sure this file exists!
  return './assets/JamahProd.png' // Default / Production
}

// 3. GET DISPLAY NAME (What user sees on screen)
const getDisplayName = () => {
  if (isDev) return 'Jamaah (Dev)'
  return 'JamaahApp'
}

// 4. GET BUNDLE ID (Crucial for side-by-side install)
const getBundleId = () => {
  if (isDev) return 'com.hassaan141.jamaahapp.dev'
  return 'com.hassaan141.jamaahapp'
}

export default () => ({
  expo: {
    name: 'jamaahapp-prod',
    slug: 'jamaahapp-prod', // You might need 'jamaahapp-production' if you renamed it earlier
    scheme: 'com.hassaan141.jamaahapp',
    // Link Dynamic Icon
    icon: getIcon(),

    // 👇 FIXED: This MUST be the New ID (738...) to work with your current login
    projectId: '738cfaa7-cbea-4042-b627-a2a351da154b',

    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,

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

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      bundleIdentifier: getBundleId(), // Dynamic ID
      googleServicesFile: './GoogleService-Info.plist',
      supportsTablet: true,
      entitlements: {
        'aps-environment': isDev ? 'development' : 'production',
      },
      infoPlist: {
        CFBundleDisplayName: getDisplayName(),
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to find nearby masjids and show accurate prayer times.',
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              'com.googleusercontent.apps.409976139410-dkmiolft5t8r3tp3rt407218rhg64bk2',
            ],
          },
        ],
      },
    },

    android: {
      package: getBundleId(), // Dynamic ID
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

    // Restore all your environment variables
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_TESTING_MODE: process.env.EXPO_PUBLIC_TESTING_MODE,
      EXPO_PUBLIC_TEST_EMAIL: process.env.EXPO_PUBLIC_TEST_EMAIL,
      EXPO_PUBLIC_TEST_PASSWORD: process.env.EXPO_PUBLIC_TEST_PASSWORD,

      eas: {
        // Redundant but safe to keep matching
        projectId: '738cfaa7-cbea-4042-b627-a2a351da154b',
      },
    },
  },
})
