import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/theme'

export default function GradientBackground({
  children,
  style,
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const { theme } = useTheme()
  const colors =
    theme.mode === 'dark'
      ? (['#1C2B24', '#284436', '#1C2B24'] as const)
      : (['#F7FAFC', '#DDF4E7', '#F7FAFC'] as const)

  return (
    <LinearGradient colors={colors} style={[styles.container, style]}>
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
