import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

export default function SignOutButton({
  onLogout,
}: {
  onLogout: () => Promise<void>
}) {
  const handleLogout = async () => {
    try {
      await onLogout()
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
