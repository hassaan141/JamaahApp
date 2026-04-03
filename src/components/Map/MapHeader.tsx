import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { MapTab } from './MapTabs'
import MapTabs from './MapTabs'

export type { MapTab }

export default function MapHeader({
  onExpand,
  selectedTab = 'masjids',
  onTabChange,
}: {
  onExpand?: () => void
  selectedTab?: MapTab
  onTabChange?: (tab: MapTab) => void
}) {
  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <View style={styles.tabsWrap}>
          {onTabChange && (
            <MapTabs selectedTab={selectedTab} onTabChange={onTabChange} />
          )}
        </View>
        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Feather name="maximize-2" size={20} color="#48BB78" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  tabsWrap: {
    flex: 1,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
})
