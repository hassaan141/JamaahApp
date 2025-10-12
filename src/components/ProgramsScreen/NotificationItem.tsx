import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export type ProgramsNotification = {
  id: string | number
  title?: string
  description?: string
  location?: string
  time?: string
  isNew?: boolean
  type?: string
  actionText?: string
}

export default function NotificationItem({
  notification,
}: {
  notification: ProgramsNotification
}) {
  const getIconName = (type?: string) => {
    switch (type) {
      case 'school':
        return 'book'
      case 'quran':
        return 'book-open'
      case 'khutbah':
        return 'mic'
      case 'event':
        return 'calendar'
      default:
        return 'bell'
    }
  }

  const getIconColor = (type?: string) => {
    switch (type) {
      case 'school':
        return '#38B2AC'
      case 'quran':
        return '#48BB78'
      case 'khutbah':
        return '#F6AD55'
      case 'event':
        return '#4299E1'
      default:
        return '#718096'
    }
  }

  const iconColor = getIconColor(notification.type)

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}
      >
        <Feather
          name={getIconName(notification.type)}
          size={16}
          color={iconColor}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.location}>{notification.location}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{notification.time}</Text>
            {notification.isNew && <View style={styles.newIndicator} />}
          </View>
        </View>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.description}>{notification.description}</Text>
        {notification.actionText && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>{notification.actionText}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: { fontSize: 12, color: '#4299E1', fontWeight: '500' },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  time: { fontSize: 12, color: '#718096' },
  newIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#48BB78',
    marginLeft: 6,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
  description: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionContainer: {
    backgroundColor: '#4299E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  actionText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
})
