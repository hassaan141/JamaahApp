import { Text, Pressable, Platform, Linking } from 'react-native'
import { useTheme } from '@/theme'
import GradientBackground from '@/components/GradientBackground'

const IOS_STORE_URL = 'https://apps.apple.com/ca/app/jamaah/id6755858703'

const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.hassaan141.jamaahapp'

export default function ForceUpdateScreen() {
  const { theme } = useTheme()
  const storeUrl = Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL

  const handleUpdate = () => {
    Linking.openURL(storeUrl)
  }

  return (
    <GradientBackground
      style={{
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
          color: theme.colors.text,
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
          color: theme.colors.textMuted,
        }}
      >
        A newer version of Jamaah is available. Please update the app to
        continue using it.
      </Text>

      <Pressable
        onPress={handleUpdate}
        style={{
          backgroundColor: theme.colors.primary,
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
    </GradientBackground>
  )
}
