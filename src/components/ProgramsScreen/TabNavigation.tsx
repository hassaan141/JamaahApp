import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type Props = {
  tabs: string[]
  activeTab: number
  onTabChange: (i: number) => void
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: Props) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, activeTab === index && styles.activeTab]}
          onPress={() => onTabChange(index)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === index && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 60,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#2D3748',
    fontWeight: '600',
  },
})
