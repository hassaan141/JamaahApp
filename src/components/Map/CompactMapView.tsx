import React from 'react'
import { View, StyleSheet } from 'react-native'
import DetailedMap from './DetailedMap'

export default function CompactMapView() {
  return (
    <View style={styles.compactMap}>
      <DetailedMap />
    </View>
  )
}

const styles = StyleSheet.create({
  compactMap: {
    height: 200,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
})
