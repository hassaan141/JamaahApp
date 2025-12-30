import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

type Props = {
  size?: number
  color?: string
}

export default function MiniLoading({ size = 24, color = '#48BB78' }: Props) {
  const spinValue = useRef(new Animated.Value(0)).current
  const opacityValue = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    // 1. Infinite Rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // 2. Gentle Opacity Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.5,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [spinValue, opacityValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
          opacity: opacityValue,
        }}
      >
        <Feather name="moon" size={size} color={color} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
})
