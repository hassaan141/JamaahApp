import { View, Text, Pressable, Platform, Linking } from 'react-native'

const IOS_STORE_URL = 'https://apps.apple.com'

const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.hassaan141.jamaahapp'

export default function ForceUpdateScreen() {
  const storeUrl = Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL

  const handleUpdate = () => {
    Linking.openURL(storeUrl)
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        Update Required
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 22,
        }}
      >
        A newer version of Jamaah is available. Please update the app to
        continue using it.
      </Text>

      <Pressable
        onPress={handleUpdate}
        style={{
          backgroundColor: '#48BB78',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Update App
        </Text>
      </Pressable>
    </View>
  )
}
