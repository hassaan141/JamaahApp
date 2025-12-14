import React, { useEffect, useRef } from 'react'
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Easing,
} from 'react-native'

type Props = {
  visible: boolean
  message?: string
  onHide?: () => void
  duration?: number
  title?: string
}

export default function ToastInfo({
  visible,
  message,
  onHide,
  duration = 3000,
  title = 'Info',
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start()
      timer = setTimeout(() => {
        hide()
      }, duration)
    } else {
      hide(true)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [visible, duration])

  const hide = (skipCb = false) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!skipCb && onHide) onHide()
    })
  }

  if (!visible) return null

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.toast}>
        <View style={styles.leftStripe} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>
        <TouchableOpacity onPress={() => hide()} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const BLUE = '#3182CE'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  leftStripe: {
    width: 4,
    height: '100%',
    backgroundColor: BLUE,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    color: BLUE,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    color: '#2C5282',
    fontSize: 13,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 20,
    lineHeight: 20,
    color: '#6C757D',
  },
})
