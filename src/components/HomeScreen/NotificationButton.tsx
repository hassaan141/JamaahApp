import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

interface NotificationButtonProps {
  navigation: {
    navigate: (route: string) => void
  }
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  navigation,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Notifications')}
    >
      <View style={styles.iconContainer}>
        <Feather name="bell" size={20} color="#2D3748" />
        <View style={styles.notificationBadge} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: 48,
  },
  iconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    top: -2,
    right: -2,
  },
})

export default NotificationButton
