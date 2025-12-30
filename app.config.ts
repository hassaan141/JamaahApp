import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const isDev = process.env.EAS_BUILD_PROFILE === 'development'

const getBundleId = () => {
  return 'com.hassaan141.jamaahapp'
}

export default () => ({
  expo: {
    name: 'Jamaah',
    slug: 'jamaahapp-prod',
    scheme: 'com.hassaan141.jamaahapp',
    icon: './assets/JamahProd.png',
    projectId: '738cfaa7-cbea-4042-b627-a2a351da154b',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,

    plugins: [
      'expo-splash-screen',
      'expo-font',
      'expo-asset',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Jamaah to use your location to update prayer times as you travel.',
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
    ],

    splash: {
      image: './assets/JamahProdNoBG.png',
      resizeMode: 'contain',
      backgroundColor: '#48BB78',
    },

    ios: {
      bundleIdentifier: getBundleId(),
      buildNumber: '3',
      googleServicesFile: './GoogleService-Info.plist',
      supportsTablet: true,
      entitlements: {
        'aps-environment': isDev ? 'development' : 'production',
      },
      infoPlist: {
        CFBundleDisplayName: 'Jamaah',
        UIBackgroundModes: ['location', 'fetch'],
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'We need your location to update prayer times automatically as you travel, even when the app is closed.',
        NSLocationAlwaysUsageDescription:
          'We need your location to update prayer times automatically as you travel, even when the app is closed.',
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
      package: getBundleId(),
      userInterfaceStyle: 'light',
      versionCode: 3,
      googleServicesFile: './google-services.json',
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/AndroidBGRemover.png',
        backgroundColor: '#FFFFFF',
      },
      icon: './assets/JamahProd.png',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: './assets/JamahProd.png',
    },

    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_TESTING_MODE: process.env.EXPO_PUBLIC_TESTING_MODE,
      EXPO_PUBLIC_TEST_EMAIL: process.env.EXPO_PUBLIC_TEST_EMAIL,
      EXPO_PUBLIC_TEST_PASSWORD: process.env.EXPO_PUBLIC_TEST_PASSWORD,
      eas: {
        projectId: '738cfaa7-cbea-4042-b627-a2a351da154b',
      },
    },
  },
})
