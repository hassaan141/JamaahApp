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
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
})
