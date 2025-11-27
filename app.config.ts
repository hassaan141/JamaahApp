export default () => ({
  expo: {
    name: 'JamaahApp',
    slug: 'jamaahapp',
    ios: {
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to find nearby masjids and show accurate prayer times.',
      },
    },
    android: {
      package: 'com.hassaan141.jamaahapp',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: '18f59a83-4081-4b80-b61b-67fc127f5577',
      },
    },
  },
})
