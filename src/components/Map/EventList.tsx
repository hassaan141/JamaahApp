import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import EventCard from '@/components/Map/EventCard'
import type { OrgPost } from '@/types'

export default function EventList({
  items,
  onPress,
  onDirections,
}: {
  items: OrgPost[]
  onPress: (item: OrgPost) => void
  onDirections: (item: OrgPost) => void
}) {
  if (!items.length) return null
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => onPress(item)}
          onDirections={() => onDirections(item)}
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
