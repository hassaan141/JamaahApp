import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@/theme'
import GradientBackground from '@/components/GradientBackground'

export default function LoadingAnimation() {
  const { theme } = useTheme()
  const spinValue = useRef(new Animated.Value(0)).current
  const scaleValue = useRef(new Animated.Value(0.8)).current
  const opacityValue = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [spinValue, scaleValue, opacityValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <GradientBackground style={styles.container}>
      <View
        style={[
          styles.loadingCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primarySoft },
            {
              transform: [{ rotate: spin }, { scale: scaleValue }],
              opacity: opacityValue,
            },
          ]}
        >
          <Feather name="moon" size={40} color={theme.colors.primary} />
        </Animated.View>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading
        </Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { opacity: opacityValue, transform: [{ scale: scaleValue }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: opacityValue,
                transform: [{ scale: scaleValue }],
                marginHorizontal: 8,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { opacity: opacityValue, transform: [{ scale: scaleValue }] },
            ]}
          />
        </View>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#48BB78' },
})
