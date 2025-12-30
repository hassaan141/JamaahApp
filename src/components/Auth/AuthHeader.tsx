import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Feather from '@expo/vector-icons/Feather'
import logo from '../../../assets/JamahProdNoBG.png'

// 1. Get screen height to detect small devices
const { height } = Dimensions.get('window')
const isSmallDevice = height < 700

type Props = {
  showBackButton?: boolean
  onBackPress?: () => void
}

export default function AuthHeader({
  showBackButton = false,
  onBackPress,
}: Props) {
  return (
    <LinearGradient colors={['#48BB78', '#48BB78']} style={styles.topSection}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <Text style={styles.appName}>Jamaah</Text>
      <Text style={styles.appTagline}>Get Connected To Your Community</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  topSection: {
    // 2. Reduce padding on small screens so it doesn't push everything down too far
    paddingBottom: 20,
    paddingTop: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    // Adjust button position slightly for tighter screens
    top: isSmallDevice ? 40 : 50,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? -5 : -20,
  },
  logoImage: {
    // 4. Shrink the logo significantly on small screens (140 vs 180)
    width: isSmallDevice ? 140 : 180,
    height: isSmallDevice ? 140 : 180,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
})
