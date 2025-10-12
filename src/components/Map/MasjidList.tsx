import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import EnhancedMasjidCard from '@/components/Map/EnhancedMasjidCard'
import type { MasjidItem } from '@/Hooks/useMasjidList'

export default function MasjidList({
  items,
  onPress,
  onDirections,
  onCall,
}: {
  items: MasjidItem[]
  onPress: (item: MasjidItem) => void
  onDirections: (item: MasjidItem) => void
  onCall: (item: MasjidItem) => void
}) {
  if (!items.length) return null
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <EnhancedMasjidCard
          item={item}
          onPress={() => onPress(item)}
          onDirections={() => onDirections(item)}
          onCall={() => onCall(item)}
        />
      )}
      keyExtractor={(item) => String(item.id)}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  )
}

const styles = StyleSheet.create({ list: { paddingBottom: 8 } })
