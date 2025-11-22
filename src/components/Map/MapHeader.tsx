import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { MapTab } from './MapTabs'
import MapTabs from './MapTabs'

export type { MapTab }

export default function MapHeader({
  title = 'Find a community',
  onExpand,
  selectedTab = 'masjids',
  onTabChange,
}: {
  title?: string
  onExpand?: () => void
  selectedTab?: MapTab
  onTabChange?: (tab: MapTab) => void
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.mapTitle}>{title}</Text>
        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Feather name="maximize-2" size={20} color="#48BB78" />
        </TouchableOpacity>
      </View>

      {onTabChange && (
        <MapTabs selectedTab={selectedTab} onTabChange={onTabChange} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  mapTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  expandButton: { padding: 4 },
})
