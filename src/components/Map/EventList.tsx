import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import EventCard from '@/components/Map/EventCard'
import type { EventItem } from '@/Supabase/fetchEventsFromRPC'

export default function EventList({
  items,
  onPress,
  onDirections,
}: {
  // 2. Update Props: Expect EventItem instead of OrgPost
  items: EventItem[]
  onPress: (item: EventItem) => void
  onDirections: (item: EventItem) => void
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

const styles = StyleSheet.create({ list: { paddingBottom: 20 } })
