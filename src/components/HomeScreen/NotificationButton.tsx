import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@/theme'

interface NotificationButtonProps {
  navigation: {
    navigate: (route: string) => void
  }
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  navigation,
}) => {
  const { theme } = useTheme()

  const handlePress = () => {
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
        <View style={styles.notificationBadge} />
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
