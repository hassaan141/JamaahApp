import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export type MapTab = 'masjids' | 'events'

export default function MapTabs({
  selectedTab,
  onTabChange,
  floating = false,
}: {
  selectedTab: MapTab
  onTabChange: (tab: MapTab) => void
  floating?: boolean
}) {
  return (
    <View
      style={[styles.tabsContainer, floating && styles.floatingTabsContainer]}
    >
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'events' && styles.activeTab]}
        onPress={() => onTabChange('events')}
        activeOpacity={0.9}
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

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'masjids' && styles.activeTab]}
        onPress={() => onTabChange('masjids')}
        activeOpacity={0.9}
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
    </View>
  )
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingTabsContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 8,
  },
  tab: {
    minHeight: 40,
    paddingVertical: 0,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#2F855A',
    borderColor: '#2F855A',
  },
  tabText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
})
