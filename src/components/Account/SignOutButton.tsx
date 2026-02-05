import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation, CommonActions } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParamList } from '@/Screens/Navigation/RootNavigator'

export default function SignOutButton({
  onLogout,
}: {
  onLogout: () => Promise<void>
}) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const handleLogout = async () => {
    console.log('[SignOutButton] Logout button pressed')
    try {
      await onLogout()
      console.log('[SignOutButton] Logout completed')
      // Navigate to Welcome screen and reset the navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        }),
      )
    } catch (e) {
      console.warn('[SignOutButton] logout error', e)
    }
  }

  const styles = StyleSheet.create({
    logoutButton: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DC3545',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    logoutText: {
      color: '#DC3545',
      fontSize: 16,
      fontWeight: '600',
    },
  })

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Sign Out</Text>
    </TouchableOpacity>
  )
}
