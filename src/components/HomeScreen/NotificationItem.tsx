import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export type Notification = {
  id: string | number
  title: string
  description?: string
  location?: string
  time?: string
  isNew?: boolean
  icon?: React.ComponentProps<typeof Feather>['name']
}

export default function NotificationItem({
  notification,
}: {
  notification: Notification
}) {
  const {
    title,
    description,
    location,
    time,
    isNew,
    icon = 'bell',
  } = notification
  return (
    <View style={styles.item}>
      <View style={styles.iconWrapper}>
        <Feather name={icon} size={16} color="#F59E0B" />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {!!time && <Text style={styles.time}>{time}</Text>}
          {!!isNew && <View style={styles.newDot} />}
        </View>
        {!!description && <Text style={styles.description}>{description}</Text>}
        {!!location && <Text style={styles.location}>{location}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 8,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F6AD55',
    marginLeft: 6,
  },
  description: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 4,
    lineHeight: 16,
  },
  location: {
    fontSize: 11,
    color: '#718096',
  },
})
