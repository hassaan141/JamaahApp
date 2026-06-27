import React, { useEffect, useRef } from 'react'
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Easing,
} from 'react-native'
import type { ToastKind } from './toast'

type Props = {
  visible: boolean
  variant: ToastKind
  message?: string
  onHide?: () => void
  duration?: number
  title?: string
}

const VARIANTS: Record<
  ToastKind,
  { title: string; color: string; messageColor: string }
> = {
  success: { title: 'Success', color: '#2F855A', messageColor: '#1D4732' },
  error: { title: 'Error', color: '#DC3545', messageColor: '#1D4732' },
  info: { title: 'Info', color: '#3182CE', messageColor: '#2C5282' },
}

export default function Toast({
  visible,
  variant,
  message,
  onHide,
  duration = 3000,
  title,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-20)).current
  const colors = VARIANTS[variant]

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
        <View style={[styles.leftStripe, { backgroundColor: colors.color }]} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.color }]}>
            {title ?? colors.title}
          </Text>
          {!!message && (
            <Text style={[styles.message, { color: colors.messageColor }]}>
              {message}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => hide()} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

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
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
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
