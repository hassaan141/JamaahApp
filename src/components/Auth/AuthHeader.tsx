import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

type Props = {
  showBackButton?: boolean
  onBackPress?: () => void
}

export default function AuthHeader({
  showBackButton = false,
  onBackPress,
}: Props) {
  return (
    <View style={styles.topSection}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={styles.moonContainer}>
        <Feather name="moon" size={60} color="#FFFFFF" />
      </View>
      <Text style={styles.appName}>Jamaah</Text>
      <Text style={styles.appTagline}>Prayer Times & Masjid Finder</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#48BB78',
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  moonContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
})
