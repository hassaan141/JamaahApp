import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import logo from '../../../assets/JamahProd.png'

const { width } = Dimensions.get('window')

const HINTS = [
  'Make sure to turn notifications on!',
  'Follow organizations to get updated.',
]

// ✅ FIX 1: Updated to a warmer 'Sage' green to match your JPG logo background
const THEME_BG_COLOR = '#E1EBC5'

// Dark green extracted from the calligraphy ink
const THEME_INK_COLOR = '#1F5126'

export default function LoadingScreen() {
  const [hintIndex, setHintIndex] = useState(0)
  const progress = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current // For text transitions

  // 1. Cycle Hints with a smooth fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setHintIndex((prev) => (prev + 1) % HINTS.length)
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 2. Animate Progress Bar
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500, // Slightly longer for a smoother feel
      useNativeDriver: false,
    }).start()
  }, [])

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* PROGRESS BAR */}
        {/* Placed distinctly below the logo */}
        <View style={styles.progressSection}>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { width: widthInterpolated }]} />
          </View>
        </View>

        {/* HINTS - Clean, floating text (No Box) */}
        <View style={styles.textWrapper}>
          <Text style={styles.label}>
            Assalamu'alaikum السَّلاَمُ عَلَيْكُمْ
          </Text>
          <Animated.Text style={[styles.hint, { opacity: fadeAnim }]}>
            {HINTS[hintIndex]}
          </Animated.Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>Setting up your experience...</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // Push content slightly up visually to balance the footer
    paddingBottom: 40,
  },
  logoContainer: {
    // This shadow helps blend the edges if the color isn't 100% perfect
    shadowColor: THEME_BG_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
  },
  logo: {
    width: width * 0.7, // Larger logo
    height: width * 0.5,
  },
  progressSection: {
    width: width * 0.6, // Shorter, cleaner bar
    height: 4, // Very thin, elegant line
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  track: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(31, 81, 38, 0.1)', // Very subtle dark green track
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: THEME_INK_COLOR, // Matching the logo ink
    borderRadius: 10,
  },
  textWrapper: {
    alignItems: 'center',
    height: 60, // Fixed height prevents jumping when text changes
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME_INK_COLOR,
    opacity: 0.6,
    letterSpacing: 1.5, // Widespacing for "premium" look
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME_INK_COLOR,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: THEME_INK_COLOR,
    opacity: 0.4,
  },
})
