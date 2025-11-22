import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export type MapTab = 'masjids' | 'events'

export default function MapTabs({
  selectedTab,
  onTabChange,
}: {
  selectedTab: MapTab
  onTabChange: (tab: MapTab) => void
}) {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'masjids' && styles.activeTab]}
        onPress={() => onTabChange('masjids')}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'masjids' && styles.activeTabText,
          ]}
        >
          Masjids
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'events' && styles.activeTab]}
        onPress={() => onTabChange('events')}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'events' && styles.activeTabText,
          ]}
        >
          Events & Classes
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    marginTop: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
})
