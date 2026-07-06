import React from 'react'
import { Text, View, type TextStyle, type StyleProp } from 'react-native'
import { useTheme } from '@/theme'

export default function RequiredLabel({
  children,
  style,
}: {
  children: React.ReactNode
  style?: StyleProp<TextStyle>
}) {
  const { theme } = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={style}>{children}</Text>
      <Text
        accessibilityLabel="required"
        style={[
          style,
          {
            color: theme.colors.danger,
            marginLeft: 3,
          },
        ]}
      >
        *
      </Text>
    </View>
  )
}
