import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function MapHeader({
  title = 'Nearby Masjids',
  onExpand,
}: {
  title?: string
  onExpand?: () => void
}) {
  return (
    <View style={styles.mapHeader}>
      <Text style={styles.mapTitle}>{title}</Text>
      <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
        <Feather name="maximize-2" size={20} color="#48BB78" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mapTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  expandButton: { padding: 4 },
})
