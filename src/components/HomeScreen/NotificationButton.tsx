import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/theme'

const NOTIFICATIONS_OPENED_STORAGE_KEY = 'hasOpenedNotifications'

interface NotificationButtonProps {
  navigation: {
    navigate: (route: string) => void
  }
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  navigation,
}) => {
  const { theme } = useTheme()
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadOpenedState = async () => {
      try {
        const hasOpenedNotifications = await AsyncStorage.getItem(
          NOTIFICATIONS_OPENED_STORAGE_KEY,
        )

        if (isMounted) {
          setShowBadge(hasOpenedNotifications !== 'true')
        }
      } catch (error) {
        console.log('Failed to load notifications opened state:', error)
      }
    }

    loadOpenedState()

    return () => {
      isMounted = false
    }
  }, [])

  const handlePress = async () => {
    setShowBadge(false)

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_OPENED_STORAGE_KEY, 'true')
    } catch (error) {
      console.log('Failed to save notifications opened state:', error)
    }

    navigation.navigate('Notifications')
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        <Feather name="bell" size={20} color={theme.colors.text} />
        {showBadge && <View style={styles.notificationBadge} />}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    height: 58,
    width: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
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
