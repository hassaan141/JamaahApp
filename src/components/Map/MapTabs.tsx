import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/theme'

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
  const { theme } = useTheme()

  return (
    <View
      style={[styles.tabsContainer, floating && styles.floatingTabsContainer]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: floating
              ? theme.colors.surfaceElevated
              : theme.colors.surfaceMuted,
            borderColor: theme.colors.border,
          },
          selectedTab === 'events' && styles.activeTab,
          selectedTab === 'events' && {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => onTabChange('events')}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.tabText,
            { color: theme.colors.textMuted },
            selectedTab === 'events' && styles.activeTabText,
          ]}
        >
          Events & Classes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: floating
              ? theme.colors.surfaceElevated
              : theme.colors.surfaceMuted,
            borderColor: theme.colors.border,
          },
          selectedTab === 'masjids' && styles.activeTab,
          selectedTab === 'masjids' && {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => onTabChange('masjids')}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.tabText,
            { color: theme.colors.textMuted },
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {},
  tabText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
})
