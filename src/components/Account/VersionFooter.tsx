import React from 'react'
import { View, Text } from 'react-native'

export default function VersionFooter({
  styles,
}: {
  styles: { versionContainer: object; versionText: object }
}) {
  return (
    <View style={styles.versionContainer}>
      <Text style={styles.versionText}>Build 1.0.0 @ Jamaah</Text>
    </View>
  )
}
